---
title: "How to speed up your bespoke machine learning algorithms by up to 100x"
description: "We recently re-architected our pricing algorithm to run AWS native. Find out how we are seeing up to a 100x speed improvement on training times."
---

At my employer Digitata, we recently re-architected our pricing algorithm to run AWS native. In this super cool blog post, I'll show you how, but more importantly **why** we are seeing a decrease in training times of up to 100x.

As you may already know, the basic ways of speeding up any kind of algorithm, can be summed up as always <span class="text-xs">(*non exhaustive list*)</span>:

- Use a bigger machine. Not always practical or affordable.
- Run it in parallell.
- Optimise the algorithm. Usually starting with the data preperation.

Traditionally at Digitata, we have preferred the lazy option: #1 - just make the machine bigger! This time, however, we decided to do it _right_.  We decided to run it in parallell. After all, that's what AWS is really good at, right?

## Making it parallell

Machine learning algorithms generally involve computationally intensive operations on large data sets. As your data sets starts growing, you will find major benefit by splitting your data set, and thus the work, into independant sets of work for your algorithm. We'll call this, the _unit of work_. First, you have to determine what will be the unit of work for your specific algorithm.

In the case of our model, this was easy. One look into the core of the python code, you find a function such as this:

```python
def calculate_data_price(row):
  dimensions = [row.segment, row.location, row.product]
  # some code here that makes the model do its thing
  # lots of clever work here
  return price

def calculate_voice_price(row):
  dimensions = [row.cell, row.time]
  # some code here that makes the model do its thing
  # lots of clever work here
  return price

```

So our unit of work is the tuple (segment, location, product) in the case of data, and (cell, time) in the case of voice.

### Problems you may have

- Data points that depend on one another - such as forecasting on a timeseries.


## Rewrite your algorithm to be idomptentent and unit-based

Once you know what your unit of work is, refactor your code so that it works on a unit of work. You basically want to end up with something like this:

```python
def do_work(item):
  # in our case, this now checks for a "type of job" - ie. voice or data.
  # so that we have one entry point

  # more ML magic redacted

```

It's also important to ensure that your code is idomptentent - there should be no nasty side effects if it executes the same unit of work twice. In our case, it'll just the output the same price twice - wasted CPU cycles but no damage done.

### Step 1. Put your code in a container
Next step (after testing of course), is to put your code in a container. In our case, we needed a recent python image with pandas installed. We ended up using quoinedev/python3.7-pandas-alpine. Then, make sure to fill out your requirements.txt so that installs all additional dependencies you may need (add boto3 to the list right from the start - you'll see later why that is important).


```Dockerfile
FROM quoinedev/python3.7-pandas-alpine

RUN mkdir -p /app
WORKDIR /app

COPY requirements.txt /app
RUN cd /app
RUN pip install -r requirements.txt

COPY . /app
RUN chmod a+x /app/task.py

#ENTRYPOINT ["/usr/bin/python"]
CMD ["/usr/local/bin/python"]

```

### Step 2. Change your data prep to query units of work.
It's one thing changing your code to work on a unit of work, but you will also need to change your data preperation queries to do the same. Ideally, you'll have all the data required available in a single data source, but this is not always practical. At the end of the day, we want to use leverage Athena with a CTAS (Create Table As) query that leverages Athena's built-in bucketing feature to split the work into batches of units of work - in our case, 1000's of batches.

```sql
# athena query
CREATE TABLE \${$.batchTableName}
WITH (
    format = 'JSON',
    external_location = '${dataProps.dataBucket.s3UrlForObject('processing')}/\${$.jobId}/',
    bucketed_by = ARRAY['jobid'],
    bucket_count = 3000
AS SELECT *
FROM source_data
WHERE "$path" = '\${$.file}'

```

This simple SQL query will execute the select query against your source data, and split it into **bucket_count** batches on the field specified by **bucketed_by** and store each batch in seperate files in the S3 path provided by **external_location**. Easy!

### Step 3. Create a SQS queue

You may have guessed where this is all going by now - we will be using some sort of queue to store the work that needs to be done by our workers.

