<template>
  <!-- steps indicator -->
  <ul class="step">
    <li :class="active === 0 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Имя группы">Шаг 1</a>
    </li>
    <li :class="active === 1 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Имя руководителя">Шаг 2</a>
    </li>
    <li :class="active === 2 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Время курса">Шаг 3</a>
    </li>
    <li :class="active === 3 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Место проведения">Шаг 4</a>
    </li>
    <li :class="active === 4 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Вебсайт руководителя">Шаг 5</a>
    </li>
    <li :class="active === 5 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Дополнительная информация">Шаг 6</a>
    </li>
    <li :class="active === 6 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Подтвердить создание">Шаг 7</a>
    </li>
    <li :class="active === 7 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Выполнено">Выполнено</a>
    </li>
  </ul>
</template>

<script>
export default {
  name: "Steps",
  props: {
    active: {
      type: Number,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles.scss";

.step {
  box-shadow: $shadow;
  position: fixed;
  bottom: 0;
  padding: 5px 10px;
  margin: 30px auto;
  width: 80%;
  border-radius: 10px;
  background-color: white;
}
</style>
