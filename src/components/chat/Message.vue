<template>
  <!-- Messages from other members -->
  <div v-if="!sender" class="message" @click="showDate = !showDate">
    <div id="details-container">
      <!-- Only show the sender's name if they didn't send the previous message -->
      <div v-if="showName" class="message-sender">
        {{ details.displayName }}
      </div>
      <div v-show="showDate" class="message-date">{{ getSent }}</div>
    </div>
    <div class="message-inline">
      <div class="message-profile">
        <!-- Only show sender avatar if they didn't send the previous message -->
        <Avatar
          v-if="showName"
          :user="{
            photoURL: details.photoURL,
            displayName: details.displayName,
          }"
        />
      </div>
      <!-- When the avatar is not displayed, add a margin of the same size -->
      <p class="message-content" :class="showName ? '' : 'add-space'">
        {{ details.message }}
      </p>
    </div>
  </div>

  <!-- Messages from logged-in user -->
  <div v-else class="message sent" @click="showDate = !showDate">
    <div id="details-container">
      <transition
        name="dateTransition"
        enter-active-class="animated fadeIn slow"
        leave-active-class="animated fadeOut"
      >
        <div v-show="showDate" class="message-date">{{ getSent }}</div>
      </transition>
    </div>
    <div class="message-inline">
      <p class="message-content">{{ details.message }}</p>
    </div>
  </div>
</template>

<script>
import Avatar from '@/components/Avatar';

export default {
  name: 'Message',
  components: {
    Avatar,
  },
  props: {
    sender: {
      type: Boolean,
      default: false,
    },
    details: {
      type: Object,
      default: null,
    },
    showName: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showDate: false,
    };
  },
  computed: {
    getSent() {
      const monthNames = [
        'Янв',
        'Фев',
        'Мар',
        'Апр',
        'Май',
        'Июн',
        'Июл',
        'Авг',
        'Сен',
        'Окт',
        'Ноя',
        'Дек',
      ];
      let messageDate = this.details.date.toDate();
      let month = monthNames[messageDate.getMonth()];

      return (
        month +
        ' ' +
        messageDate.getDate() +
        ', ' +
        messageDate.toLocaleString('ru-RU', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        })
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.message {
  cursor: pointer;
  margin-bottom: 5px;
  max-width: 300px;
  #details-container {
    color: darkgrey;
    font-size: 12px;
    display: flex;
    flex-flow: row nowrap;
    .message-sender {
      margin-left: 40px;
    }
    .message-date {
      margin-right: 10px;
      margin-left: auto;
      text-align: right;
    }
  }
  .message-inline {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    .message-content.add-space {
      margin-left: 36px;
    }
    .message-profile {
      align-self: flex-end;
      display: inline-block;
      margin-left: 4px;
      margin-bottom: 2px;
      .avatar.avatar-lg {
        width: 30px;
        height: 30px;
        font-size: 15px;
      }
    }
    .message-content {
      text-align: left;
      margin: 0 4px;
      padding: 3px 6px;
      border-radius: 14px;
      color: black;
      word-break: normal;
      background-color: #f1f3f4;
    }
  }
}
.message.sent {
  width: 100%;
  .message-inline {
    flex-direction: row-reverse;
    .message-content {
      margin-left: 25%;
      background-color: #d2e3fc;
    }
  }
}
</style>
