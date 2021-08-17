<template>
<div class="theme">
  <div class="bg-gray-50 px-5 sm:px-7 md:px-10">
    <div class="prose md:prose-xl prose-green mx-auto">
      <header class="navbar mb-10 sm:mb-16 md:mb-20">
        <NavBar />
      </header>
      <main class="pb-10 sm:pb-16 md:pb-20">
        <template v-if="post">
        <h1>{{ post.title }}</h1>
        <div class="text-sm text-gray-500"><time class="mr-3">{{ post.publishDate }}</time> 🕒 {{ post.readMins }}min</div>
        <PostTags :post="post" class="mt-5" />
        </template>
        <Content class="content animate-fadeIn"/>
        <template v-if="post">
          <!--<Newsletter />-->
        <h2>Other Articles</h2>
        <Posts/>
        </template>
      </main>
    </div>
  </div>
  <footer class="px-5 sm:px-7 md:px-10 text-center text-gray-400 text-sm my-5">
    <div class="text-center mb-5">
      <a href="https://github.com/nicokruger" target="_blank" class="unstyled transition-opacity inline-block opacity-70 hover:opacity-100 mr-5" title="Github: nicokruger">
        <svg role="img" viewBox="0 0 24 24" width="24" height="24"  xmlns="http://www.w3.org/2000/svg" fill="var(--c-brand)"><title>GitHub icon</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
      </a>

      <a href="https://www.linkedin.com/in/nico-kruger-087ab0121/" target="_blank" class="unstyled transition-opacity inline-block opacity-70 hover:opacity-100 mr-5" title="Github: nicokruger">

        <svg role="img" height="24" width="30" viewBox="-11.493675 -16.3118 99.61185 97.8708"><path fill="#0a66c2" d="M72.865 61.1094a1.2 1.2 0 001.21-1.269c0-.9-.543-1.33-1.657-1.33h-1.8v4.712h.677v-2.054h.832l.019.025 1.291 2.029h.724l-1.389-2.1zm-.783-.472h-.785v-1.593h.995c.514 0 1.1.084 1.1.757 0 .774-.593.836-1.314.836m-16.873-5.433h-9.6v-15.034c0-3.585-.064-8.2-4.993-8.2-5 0-5.765 3.906-5.765 7.939v15.294h-9.6v-30.916h9.216v4.225h.129a10.1 10.1 0 019.093-4.994c9.73 0 11.524 6.4 11.524 14.726zm-40.79-35.143a5.571 5.571 0 115.57-5.572 5.571 5.571 0 01-5.57 5.572m4.8 35.143h-9.61v-30.917h9.61zm40.776-55.2H4.781A4.728 4.728 0 000 4.6744v55.439a4.731 4.731 0 004.781 4.675h55.21a4.741 4.741 0 004.8-4.675V4.6704a4.738 4.738 0 00-4.8-4.67"/><path fill="#0a66c2" d="M72.164 56.4114a4.418 4.418 0 10.085 0h-.085m0 8.33a3.874 3.874 0 113.809-3.938v.065a3.791 3.791 0 01-3.708 3.871h-.1"/></svg>

      </a>

    </div>
    <p class="mb-3">© 2021 Nico Kruger, All rights reserved.</p>
    <p style="text-xs">
    Original image of Eddie Vedder sitting in a tree playing Ukelele by <i>Buggy</i> from <a class="underline" href="http://www.theskyiscrape.com">the sky i scrape</a>
    </p>


    <!--
      Maybe of interest later?
    <p>
      <a href="/open-blogging/" class="mr-3">Open blogging</a>
      <span class=" border-l-2 border-grey-50"></span>
      <a href="/subscribe/" class="ml-3">Subscribe</a>
    </p>
    -->

  </footer>
  <Debug />
</div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import PostTags from './components/PostTags.vue'
import { inject, computed } from 'vue'
import { postForPath } from './utils'
import { useRoute } from 'vitepress/dist/client/app/router';

export default {
  components: {
    PostTags,
    NavBar,
  },
  setup() {
    const zoom = inject('zoom')
    const route = useRoute()
    const post = computed(() => postForPath(route.path))

    return {
      zoom,
      post
    }
  },
  watch: {
    $page: {
      handler () {
        if (this.zoom && this.$page.relativePath !== 'index.md') {
          setTimeout(() => {
            this.zoom.listen('.prose img')
          }, 500)
        }
        if (typeof document !== 'undefined') {
          // @todo fix vitepress seo
          document.querySelector('meta[name="description"]').setAttribute('content', this.$page.frontmatter.description);
        }
      },
      immediate: true
    }
  },
}
</script>

<style>
.theme {
  min-height: calc(100vh - 80px);
}
</style>
