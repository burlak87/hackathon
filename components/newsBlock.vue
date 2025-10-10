<script setup>
    let {obj} = defineProps(["obj"])


    let time = (Date.now() - new Date(obj.date).getTime()) + (new Date().getTimezoneOffset() * 60 * 100)

    time = new Date(time).getHours()

</script>

<template>
<section>
        <h1>{{ obj.title }}</h1>
        <article class="item-info">
            <h2>{{ obj.source }}</h2>
            <p>{{ obj.time }} часа назад</p>
        </article>
        <p>{{ obj.summary_text }}</p>
        <article class="item-link">
            <a :href="obj.url">Читать оригинал</a>
        </article>
    </section>
</template>

<style scoped lang="scss">
    section {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        gap:30px;
        padding: 40px 25px;
        border: 2px solid black;
        border-radius: 20px;
        background-color: rgba(#FFFFFF, 0.5);
        width: 100%;

        >h1 {
            font-size: 14px;
            width: 70%;
        }

        >.item-info {
            display: flex;
            flex-direction: column;
            align-items: start;
            justify-content: start;
            gap:20px;
            width: 100%;

            >h2 {
                font-size: 10px;
                color:#6A50D8;
            }

            >p {
                font-size: 10px;
            }
        }

        >p {
            font-size: 8px;
            width: 100%;
        }

        >.item-link {
            display: flex;
            justify-content: end;
            align-items: center;
            width: 100%;

            >a {
                text-decoration: none;
                color:#6A50D8;
                font-size: 6px;
                background-color: inherit;
                border: 2px solid #6A50D8;
                border-radius: 10px;
                padding: 10px 15px;
            }
        }
    }

    @media screen and (max-width:1350px) {
        section {
            width: 80% !important;

            >h1 {
                font-size: 12px !important;
                width: 100% !important;
            }

        }
    }

    @media screen and (max-width:700px) {
         section {
            width: 100% !important;

            >h1 {
                font-size: 9px !important;
                width: 100% !important;
            }

        }
    }
</style>