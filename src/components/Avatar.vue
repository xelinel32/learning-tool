<template>
  <div
    v-if="!user"
    class="avatar loading loading-indicator"
    :class="getLoadingSize"
  ></div>
  <figure
    v-else-if="user.photoURL === null"
    :style="{ backgroundColor: color }"
    :data-initial="computedInitials"
    class="avatar"
    :class="getSize"
  ></figure>

  <figure v-else class="avatar" :class="getSize">
    <img :src="user.photoURL" />
  </figure>
</template>

<script>
export default {
  name: 'Avatar',
  props: {
    user: {
      type: Object,
      required: false,
      default: null,
    },
    color: {
      type: String,
      default: '#f6f6f6',
    },
    size: {
      type: String,
      default: '',
    },
  },
  computed: {
    computedInitials() {
      return this.user.displayName
        .split(' ')
        .map((word) => {
          return word[0];
        })
        .join('');
    },
    // Set size of the avatar icon
    getSize() {
      switch (this.size) {
        case '':
          return '';
        case 'sm':
          return 'avatar-sm';
        case 'lg':
          return 'avatar-lg';
        case 'xl':
          return 'avatar-xl';
      }
      return '';
    },
    // Set the size of the corresponding loading indicator
    getLoadingSize() {
      switch (this.size) {
        case '':
          return 'load';
        case 'sm':
          return ' load-sm';
        case 'lg':
          return 'loading-lg load-lg';
        case 'xl':
          return 'loading-lg load-xl';
      }
      return '';
    },
  },
};
</script>

<style lang="scss" scoped>
.loading-indicator {
  background-color: #3c3c3c;
}
.load {
  height: 32px;
  width: 32px;
}
.load-sm {
  height: 24px;
  width: 24px;
}
.load-lg {
  height: 48px;
  width: 48px;
}
.load-xl {
  height: 64px;
  width: 64px;
}

.avatar img {
  z-index: 0;
}

figure.avatar {
  color: #3c3c3c;
}
</style>
