<template>
  <div class="full-height">
    <div v-if="activeGroup" id="sidebar" :class="show ? 'active' : 'collapsed'">
      <ul class="menu">
        <!-- Group Details -->
        <li v-show="show" class="menu-item" style="padding-top: 10px;">
          <div class="tile tile-centered">
            <div class="tile-content">
              <h5>{{ activeGroup.className }}</h5>
              <p style="margin: 0;">{{ activeGroup.instructorName }}</p>
            </div>
          </div>
        </li>
        <hr v-show="show" class="section-divider" />

        <!-- Home Link -->
        <li class="menu-item" :class="show ? 'text-left' : 'text-center'">
          <router-link
            :class="$route.name === 'home' ? 'active' : ''"
            :to="{ name: 'home' }"
          >
            <i :class="{ 'large-icon': !show }" class="fas fa-home"></i>
            <span v-show="show"> Home page </span>
          </router-link>
        </li>

        <!-- Flashcards Link -->
        <li class="menu-item" :class="show ? 'text-left' : 'text-center'">
          <router-link
            :class="
              $route.name === 'flashcards'
                ? 'active'
                : '' || $route.name === 'study'
                ? 'active'
                : '' || $route.name === 'editFlashcards'
                ? 'active'
                : '' || $route.name === 'createFlashcards'
                ? 'active'
                : ''
            "
            :to="{ name: 'flashcards' }"
          >
            <i :class="{ 'large-icon': !show }" class="fas fa-sticky-note"></i>
            <span v-show="show"> Cards</span>
          </router-link>
        </li>

        <!-- Quizzes Link-->
        <li class="menu-item" :class="show ? 'text-left' : 'text-center'">
          <router-link
            :to="{ name: 'createQuiz' }"
            :class="
              $route.name === 'createQuiz'
                ? 'active'
                : '' || $route.name === 'quiz'
                ? 'active'
                : ''
            "
            ><i :class="{ 'large-icon': !show }" class="fas fa-pencil-alt"></i>
            <span v-show="show"> Tests</span>
          </router-link>
        </li>

        <!-- Agenda Link-->
        <li class="menu-item" :class="show ? 'text-left' : 'text-center'">
          <router-link
            :to="{ name: 'agenda' }"
            :class="$route.name === 'agenda' ? 'active' : ''"
            ><i
              :class="{ 'large-icon': !show }"
              class="fas fa-calendar-alt"
            ></i>
            <span v-show="show"> Events</span>
          </router-link>
        </li>

        <!-- Notes Link -->
        <li class="menu-item" :class="show ? 'text-left' : 'text-center'">
          <router-link
            :to="{ name: 'notes' }"
            :class="
              $route.name === 'notes'
                ? 'active'
                : '' || $route.name === 'note'
                ? 'active'
                : ''
            "
          >
            <i :class="{ 'large-icon': !show }" class="fas fa-file"></i>
            <span v-show="show"> Tasks</span>
          </router-link>
        </li>

        <!-- Group Members Link -->
        <li class="menu-item" :class="show ? 'text-left' : 'text-center'">
          <div v-show="show" class="menu-badge">
            <label class="member-num label label-primary">
              {{ activeGroup.members.length }}
            </label>
          </div>
          <router-link
            :class="$route.name === 'members' ? 'active' : ''"
            :to="{ name: 'members' }"
            ><i :class="{ 'large-icon': !show }" class="fas fa-user-circle"></i>
            <span v-show="show"> Members</span>
          </router-link>
        </li>

        <!-- Group Settings Link-->
        <li
          v-if="activeGroup.owner === $store.getters.uid"
          class="menu-item"
          :class="show ? 'text-left' : 'text-center'"
        >
          <router-link
            :to="{ name: 'settings' }"
            :class="$route.name === 'settings' ? 'active' : ''"
          >
            <i :class="{ 'large-icon': !show }" class="fas fa-cog"></i>
            <span v-show="show"> Settings</span>
          </router-link>
        </li>
      </ul>

      <!-- Sidebar Toggle Button -->
      <a id="toggle-button" @click="$store.commit('toggleSidebarActive')">
        <i class="fas" :class="show ? 'fa-arrow-left' : 'fa-arrow-right'"></i>
      </a>
    </div>

    <!-- Page Content Slot / Error Handling -->
    <div id="sidebar-page-content">
      <!-- Slot where all other page content will be inserted -->
      <slot v-if="isMember && !isLoading"></slot>

      <!-- If they are not a member, show the generic error message -->
      <div v-else-if="!isMember && !isLoading" style="margin-top: 10%;">
        <img
          style="width: 10em;"
          class="undraw-svg"
          src="@/assets/undraw_warning.svg"
          alt="Error Loading Group"
        />
        <h1>Error loading group data...</h1>
        <h2>Please make sure you are a member of the group.</h2>
        <h2>Please make sure the group exists.</h2>
      </div>
      <div v-else>
        <div class="loading loading-lg"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { checkAccess } from "@/scripts/groupFuncs";
import { db } from "@/firebaseConfig";

export default {
  name: "SideBar",
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activeGroup: null,
      isMember: false,
      isLoading: true
    };
  },
  // Reload group data if the group's url changes
  watch: {
    "$route.params.groupID"(id) {
      this.loadGroupData(id);
    }
  },
  created() {
    this.loadGroupData(this.$route.params.groupID);
  },
  methods: {
    loadGroupData(groupID) {
      // Make sure the user is part of the group
      checkAccess(this.$store.getters.uid, this.$route.params.groupID)
        .then(() => {
          // If they are... load the group's data.
          this.$bind(
            "activeGroup",
            db.collection("study-groups").doc(groupID)
          ).then(active => {
            this.activeGroup === active;
          });

          this.isMember = true;
          this.isLoading = false;
        })
        //  Catch load error
        .catch(() => {
          this.isLoading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles.scss";

#toggle-button {
  cursor: pointer;
  padding: 10px;
  color: $secondary-light;
  text-align: center;
  &:hover {
    color: $light;
  }
}
.full-height {
  height: $content-height;
}
#sidebar-page-content {
  height: 100%;
  overflow: auto;
}
#sidebar {
  color: white;
  height: calc(100% - 60px);
  width: 200px;
  position: absolute;
  z-index: 200;
  top: 60px;
  left: 0;
  background-color: #222f3e;
  transition: 0.25s;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  .menu {
    background-color: transparent;
    box-shadow: none;
    min-width: 50px;
    .tile-content {
      color: white;
    }
    li.menu-item {
      color: $secondary-light;
      i.fas {
        color: darken($secondary-light, 30);
      }
      i.large-icon {
        text-align: center;
        font-size: 25px;
      }
    }
    li > a.active {
      background-image: $orange-gradient !important;
      color: white !important;
      i.fas {
        color: white;
      }
    }
    .member-num {
      padding-left: 8px;
      padding-right: 8px;
    }
  }
  &.collapsed {
    width: 50px;
    min-width: 50px;
    .menu {
      padding: 0;
    }
  }
  &.active {
    width: 200px;
    min-width: 200px;
  }
}
.section-divider {
  height: 1px;
  background-image: $orange-gradient;
  border: none;
}
</style>
