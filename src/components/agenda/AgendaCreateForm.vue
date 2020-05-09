<template>
  <div class="agenda-form">
    <div class="modal-title h5">{{ getTitle }}</div>

    <div class="horiz-tiles">
      <div class="tile t-left">
        <div class="tile-content text-left">
          <div class="tile-title text-bold">Название</div>
          <div class="tile-subtitle">
            <input
              class="form-input"
              v-model="item.title"
              type="text"
              maxlength="26"
              placeholder="Введите название"
              @input="$emit('publish', item)"
            />
          </div>
        </div>
      </div>

      <div class="tile t-right">
        <div class="tile-content text-left">
          <div class="tile-title text-bold">Дата / Время проведения</div>
          <div class="tile-subtitle date-time-container">
            <flat-pickr
              v-model="item.date"
              class="form-input"
              :config="config"
              @on-change="$emit('publish', item)"
            ></flat-pickr>
          </div>
        </div>
      </div>
    </div>

    <div class="tile">
      <div class="tile-content text-left">
        <div class="tile-title text-bold">Описание</div>
        <div class="tile-subtitle">
          <textarea
            class="form-input"
            ref="descInput"
            v-model="item.description"
            rows="3"
            name="description"
            placeholder="Введите описание события"
            @input="inputChanged"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import flatPickr from 'vue-flatpickr-component';
import { Russian } from 'flatpickr/dist/l10n/ru';
import 'flatpickr/dist/flatpickr.css';
import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate.js';
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';

export default {
  name: 'AgendaCreateForm',
  components: {
    flatPickr,
  },
  props: {
    editItem: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      // flatpickr configuration
      config: {
        locale: Russian,
        minDate: Date.now(), // Disables all previous dates on the calendar.
        dateFormat: 'Y-m-d',
        time_24hr: true,
        altInput: true,
        altFormat: 'F j, Y H:i',
        enableTime: true,
        plugins: [new ConfirmDatePlugin()],
      },
      // New item's details
      item: {
        title: '',
        description: '',
        date: null,
      },
    };
  },
  computed: {
    getTitle() {
      if (this.editItem) {
        return 'Изменить существующий ивент';
      }
      return 'Создание нового ивента';
    },
  },
  created() {
    // Transfer all the prop data to the editable data if they are editing an existing event
    if (this.editItem !== null) {
      this.item.title = this.editItem.title;
      this.item.description = this.editItem.description;

      this.item.date = this.editItem.date.toDate();
      this.config.defaultDate = this.item.date;
    }
  },
  methods: {
    inputChanged() {
      this.$emit('publish', this.item);
      const textBox = this.$refs.descInput;
      textBox.style.height = '1px';
      textBox.style.height = textBox.scrollHeight + 1 + 'px';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.agenda-form {
  background-color: white;
  padding: 10px;
}
textarea {
  resize: none;
}
#title-input,
#desc-input {
  width: 100%;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid $dark;
  &:focus {
    outline: none;
  }
}
.horiz-tiles {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  .tile {
    flex: 1;
  }
  .t-left {
    margin-right: 10px;
  }
  .t-right {
    margin-left: 10px;
  }
}
.date-time-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
}
.tile-title {
  padding: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-family: $secondary-font;
}
</style>
