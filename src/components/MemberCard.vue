<template>
  <!-- Add Member Card -->
  <div v-if="add" class="profile-card c-hand hoverable">
    <div class="gradient-border add">
      <div class="add-button">
        <!-- <h1 class="button-icon">+</h1> -->
        <h1 class="button-icon"><i class="fas fa-plus"></i></h1>
      </div>
    </div>
    <h2>Invite some members</h2>
    <div class="gradient-underline"></div>
  </div>

  <!-- Member Display Card -->
  <div v-else class="profile-card">
    <div class="profile-background"></div>
    <div class="gradient-border">
      <Avatar
        class="profile-image"
        :user="{ photoURL: photoURL, displayName: displayName }"
      />
    </div>
    <h2 id="member-name" style="width: 100%;" class="text-ellipsis">
      {{ displayName }}
      <!-- Show crown icon on the owner's card -->
      <i
        v-if="owner"
        style="color: gold; z-index: 999;"
        class="fas fa-crown"
      ></i>
    </h2>
    <p class="profile-desc">{{ description }}</p>
  </div>
</template>

<script>
import Avatar from '@/components/Avatar';

export default {
  name: 'MemberCard',
  components: {
    Avatar,
  },
  props: {
    photoURL: {
      type: String,
      default: '',
    },
    displayName: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    add: {
      type: Boolean,
      default: false,
      required: false,
    },
    owner: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.profile-card {
  height: 300px;
  width: 300px;
  margin: 0 20px 20px 0px;
  user-select: none;
  z-index: 1;
  .gradient-underline {
    display: none;
    height: 4px;
    width: 60%;
    margin: auto;
    margin-top: -15px;
    background-image: $orange-gradient;
  }
  &:hover {
    .profile-background {
      box-shadow: $shadow-hovered;
    }
  }
}
.profile-desc {
  color: $secondary-light;
  font-size: 14px;
  padding: 1em;
}
.profile-background {
  margin-top: 70px;
  position: absolute;
  background-color: white;
  width: 300px;
  height: 200px;
  z-index: -1;
  transition: box-shadow 0.3s linear;
}
.hoverable {
  border-image: $orange-gradient;
  border-image-slice: 1;
  border-width: 2px;
  &:hover {
    border-width: 4px;
    box-shadow: $shadow-hovered;
    .gradient-underline {
      display: block;
    }
  }
}

h2 {
  font-size: 1.5em;
}
.gradient-border {
  margin: 10px auto;
  margin-top: 20px;
  height: 110px;
  width: 110px;
  border-radius: 50%;
  background-image: $blue-gradient;
  z-index: 10;
}
.button-icon {
  font-size: 6em;
  position: relative;
  top: 20px;
}
.add {
  background-image: $nav-gradient;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.add-button {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: $light;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
}
.profile-image {
  position: relative;
  top: 5px;
  width: 100px;
  height: 100px;
  font-size: 60px;
}
#member-name {
  font-size: 20px;
}
</style>
