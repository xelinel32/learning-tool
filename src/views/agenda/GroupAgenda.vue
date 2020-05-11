<template>
  <div>
    <page-title>
      <template slot="left">
        <button class="btn btn-primary" @click="showCreateForm(true)">
          Добавить <i class="fas fa-plus"></i>
        </button>
      </template>
      <template slot="center">
        Груповые события
      </template>
      <template slot="right">
        <!-- Save Item Form Button -->
        <button
          v-if="isShowingItemForm"
          class="btn btn-success btn-action split"
          :class="!validInfoEntered ? 'disabled' : ''"
          @click="createItem"
        >
          <i class="fas fa-save"></i>
        </button>

        <!-- Existing Item Button Bar -->
        <div
          v-if="
            selectedIndex !== -1 &&
              selectedItem.creatorID === $store.getters.uid
          "
        >
          <!-- Edit an existing agenda item that you've created -->
          <button
            v-if="!isShowingItemForm"
            class="btn btn-success btn-action"
            @click="showCreateForm(false)"
          >
            <i class="fas fa-pen"></i>
          </button>

          <!-- Delete an existing agenda item that you've created -->
          <confirm-button
            class="split"
            @buttonClicked="deleteItem(selectedItem)"
          >
            <template v-slot:title>
              Удалить ивент?
            </template>
            <template v-slot:body>
              Ивент дня будет окончательно удален. Другие участники группы
              больше не увидят его.
            </template>
            <template v-slot:button-text>
              Удалить
            </template>
          </confirm-button>
        </div>
      </template>
    </page-title>

    <div class="content-container">
      <!-- List of all agenda items -->
      <div class="item-list">
        <div
          v-if="isLoadingItems"
          id="loading-indicator"
          class="loading loading-lg"
        ></div>
        <div
          v-for="(item, index) in agendaItems"
          v-else
          :key="item.creationDate.toDate().getTime()"
        >
          <agenda-item-date-header
            v-if="showDateHeader(index)"
            :date="item.date.toDate()"
          />
          <!-- :selected="checkSelected(index)" -->
          <agenda-item
            :selected="selectedIndex === index"
            :item="item"
            @itemSelected="handleSelected(index)"
          />
        </div>
      </div>
      <div class="divider-vert bg-dark"></div>

      <!-- Right side container -->
      <div class="item-detail-container">
        <!-- Clicked agenda item's details -->

        <agenda-item-detail
          v-if="selectedItem && !isShowingItemForm"
          :selected-item="selectedItem"
        />
        <!-- Show create new item form -->
        <agenda-create-form
          v-else-if="isShowingItemForm"
          :edit-item="selectedItem"
          @publish="updateNewItem"
        />
        <div
          v-else-if="!isLoadingItems && agendaItems.length === 0"
          class="empty"
        >
          <div class="empty-icon">
            <img
              id="undraw"
              class="undraw-svg"
              src="@/assets/undraw_no_data.svg"
              alt="No Study Groups"
            />
          </div>
          <p class="empty-title h5">
            У вас пока, что нет созданных событий 😞
          </p>
        </div>

        <div
          v-else-if="!isLoadingItems && agendaItems.length > 0"
          class="empty"
        >
          <div class="empty-icon">
            <img
              id="undraw"
              class="undraw-svg"
              src="@/assets/undraw_select.svg"
              alt="No Study Groups"
            />
          </div>
          <p class="empty-title h5">
            Выберите ивент и посмотрите его описание
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageTitle from '@/components/navigation/PageTitle';
import AgendaItem from '@/components/agenda/AgendaItem';
import AgendaItemDateHeader from '@/components/agenda/AgendaItemDateHeader';
import AgendaItemDetail from '@/components/agenda/AgendaItemDetail';
import AgendaCreateForm from '@/components/agenda/AgendaCreateForm';
import ConfirmButton from '@/components/ConfirmButton';
import { parse, isSameDay } from 'date-fns';
import firebase, { db } from '@/firebaseConfig';

export default {
  name: 'GroupAgenda',
  components: {
    ConfirmButton,
    PageTitle,
    AgendaItem,
    AgendaItemDateHeader,
    AgendaItemDetail,
    AgendaCreateForm,
  },
  data() {
    return {
      isLoadingItems: true,
      isShowingItemForm: false,
      selectedItem: null,
      agendaItems: [],
      selectedIndex: -1,
      newItem: null,
    };
  },
  computed: {
    validInfoEntered() {
      if (
        this.newItem !== null &&
        this.newItem.title !== '' &&
        this.newItem.description !== '' &&
        this.newItem.date !== null
      ) {
        return true;
      } else {
        return false;
      }
    },
  },

  created() {
    this.$bind(
      'agendaItems',
      db
        .collection('study-groups')
        .doc(this.$route.params.groupID)
        .collection('agenda')
        .orderBy('date', 'asc')
    ).then((agendaItems) => {
      this.agendaItems === agendaItems;
      this.isLoadingItems = false;
      if (this.$route.params.itemID) {
        this.searchForItem(this.$route.params.itemID);
      }
    });
  },
  methods: {
    searchForItem(itemID) {
      for (let i = 0; i < this.agendaItems.length; i++) {
        if (this.agendaItems[i].id === itemID) {
          this.selectedItem = this.agendaItems[i];
          this.selectedIndex = i;
          break;
        }
      }
    },
    handleSelected(index) {
      this.isShowingItemForm = false;
      this.selectedItem = this.agendaItems[index];
      this.selectedIndex = index;
      this.$router.push(
        `/${this.$route.params.groupID}/agenda/${this.agendaItems[index].id}`
      );
    },
    showDateHeader(index) {
      if (index !== 0) {
        return !isSameDay(
          this.agendaItems[index].date.toDate(),
          this.agendaItems[index - 1].date.toDate()
        );
      } else {
        // The first item will always show the header.
        return true;
      }
    },
    showCreateForm(isCreateNew) {
      if (isCreateNew) {
        this.selectedItem = null;
        this.selectedIndex = -1;
      }
      this.isShowingItemForm = true;
    },
    updateNewItem(item) {
      this.newItem = item;
    },
    deleteItem(item) {
      db.collection('study-groups')
        .doc(this.$route.params.groupID)
        .collection('agenda')
        .doc(item.id)
        .delete()
        .then(() => {
          this.selectedItem = null;
          this.selectedIndex = -1;
        });
    },
    createItem() {
      // Create new item
      let dateObj = parse(this.newItem.date);
      let user = firebase.auth().currentUser;

      if (this.selectedItem === null && this.selectedIndex === -1) {
        db.collection('study-groups')
          .doc(this.$route.params.groupID)
          .collection('agenda')
          .add({
            title: this.newItem.title,
            description: this.newItem.description,
            date: dateObj,
            creationDate: new Date(),
            creatorID: this.$store.getters.uid,
            creatorPhoto: this.$store.getters.photoURL,
            creatorName: user.displayName,
          })
          .then(() => {
            this.isShowingItemForm = false;
          });
      } else {
        // Update existing item
        db.collection('study-groups')
          .doc(this.$route.params.groupID)
          .collection('agenda')
          .doc(this.selectedItem.id)
          .update({
            title: this.newItem.title,
            description: this.newItem.description,
            date: dateObj,
          })
          .then(() => {
            this.isShowingItemForm = false;
            this.selectedItem = null;
            this.selectedIndex = -1;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

#loading-indicator {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}
.empty {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  background-color: $light;
}
#undraw {
  width: 10em;
}
.content-container {
  height: $page-with-header-height;
  display: flex;
  flex-flow: row nowrap;
}
.item-list {
  height: 100%;
  padding: 20px;
  overflow: auto;
  flex: 1;
}
.item-detail-container {
  padding: 20px;
  height: 100%;
  flex: 3;
  overflow: auto;
}
.divider-vert {
  padding: 0;
}
</style>
