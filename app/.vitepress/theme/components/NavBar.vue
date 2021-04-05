<template>
<div class="w-full flex items-center justify-between border-b-2 border-gray-100 py-3 md:py-6">
  <div class="relative ml-2 md:ml-0">
    <a
        class="logo"
        :aria-label="$site.title"
        :href="$site.base"
    >
    <img src="/resources/tsis_ed.png" width="80" height="80" loading="lazy" alt="ed vedder tree" style="margin-top: 0 !important; margin-bottom: 0 !important;" class="inline rounded-full object-center md:h-20 md:w-20 h-12 w-12 object-cover" />
      <span class="font-bold font-header text-green-700">
        in<span class="text-green-500">my</span>tree
      </span>
    </a>
  </div>
  <div class="flex-grow"></div>
  <NavBarLinks/>
</div>
</template>

<script>
import { withBase } from '../utils';
import NavBarLinks from './NavBarLinks.vue';
export default {
  components: {
    NavBarLinks
  },
  setup() {
    return { withBase };
  }
};
</script>

<style lang="scss">
.blob {
  position: absolute;
  left: -25px;
  top: -14px;
  z-index: 0;
  transform: rotate(45deg);
  opacity: 0.2;
}
.logo {
  position: relative;
  font-size: 1.8em !important;
  color: rgb(5, 150, 105) !important;
  z-index: 1;
}
</style>
