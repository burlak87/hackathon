<script setup>
    let dataTags = defineProps(["tag"])

    
</script>

<template>
    <input @change="$emit('changeTags', dataTags.tag)" type="checkbox"  name="checkboxForm" id="checkedFilter">
</template>

<style scoped lang="scss">
    input {
        width: 25px;
        height: 25px;
        box-shadow: none;
        background: #6A50D8;
        appearance: none;
        position: relative;
        border: 2px solid #FFFFFF;
        border-radius: 2px;
        position: relative;
    }

    input::after {           
        position: absolute;
        top: -2px;
        left: -2px;
        width: 25px;
        height: 25px;
        font-size: 26px;
        transition: 500ms;
        overflow: hidden;     
    }

    input:checked::after {
        transition: 500ms;
        width: 25px;
        height: 25px;
        background: #FFFFFF;
        color:#6A50D8;
        content: "✔";
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 10px;
        box-sizing: border-box;
    }
</style>