<template>
  <!-- Study Group Switcher -->
  <div v-if="studyGroups.length > 0" class="dropdown">
    <a id="group-button" class="btn dropdown-toggle" tabindex="0">
      <i class="fas fa-caret-down"></i>
    </a>

    <!-- Your Study Group List Dropdown Items -->
    <ul class="menu group-menu">
      <div v-for="(group, index) in studyGroups" :key="index">
        <li>
          <div
            class="group-card"
            :class="group.id == $route.params.groupID ? 'current-group' : ''"
          >
            <router-link
              class="card-text"
              :to="{ name: 'home', params: { groupID: group.id } }"
            >
              <p
                id="groupNameText"
                class="card-text text-ellipsis text-bold text-large"
              >
                {{ group.className }}
              </p>
              <p id="instructorText" class="card-text text-light text-italic">
                {{ group.instructorName }}
              </p>
            </router-link>
          </div>
        </li>
      </div>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'GroupDropdown',
  props: {
    studyGroups: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

#groupNameText {
  font-family: $secondary-font;
}
#instructorText {
  color: transparent;
  font-size: 0;
  transition: font-size 0.1s, color 0.1s;
  transition-timing-function: ease-in;
}
.group-menu {
  box-shadow: $shadow-heavy;
  background-image: $orange-gradient;
  border: 1px solid #000;
  max-width: 250px;
  min-width: 250px;
  margin-top: 4px;
  padding-top: 0;
}
.group-card {
  width: 100%;
  max-width: 250px;
  padding: 2px;
  border: solid 2px white;
  transition: padding-top 0.1s, padding-bottom 0.1s;
  transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
  &:hover {
    #instructorText {
      font-size: 15px;
      color: #000;
    }
  }
  a {
    text-decoration: none;
  }
}
.current-group {
  background-image: $orange-gradient;
  border: none;
  p {
    color: white;
  }
}
.card-text {
  user-select: none;
  margin: 0;
  color: $secondary;
}
#group-button {
  background-color: $transparent-dark;
  color: white;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: white;
    color: $primary;
  }
}
</style>
