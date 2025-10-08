<script setup>
    onMounted(() => {
        document.body.style.overflow="hidden"
    })

    onBeforeUnmount(() => {
        document.body.style.overflow="scroll"
    })

    const timeReload = ref([])

    function addTimeReloadLocal(el) {
        if(timeReload.value.indexOf(el) == -1) {
            timeReload.value.push(el)
        } else {
            timeReload.value.splice(timeReload.value.indexOf(el), 1)
        }
    }
</script>

<template>
    <section @click="$emit('drop-modal')" class="owerflou">
        <article @click.stop class="modal">
            <h2>ФИЛЬТРЫ И <br>НАСТРОЙКИ</h2>
            <nav class="filters-scroll">
                <article class="filters-main">
                <h3>ВЫБЕРИТЕ <br>ИСТОЧНИКИ <br>НОВОСТЕЙ</h3>
                <form name="form_">
                    
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'NewsAPI'" />
                        <label>
                        CNN <br>МЕЖДУНАРОДНЫЕ НОВОСТИ
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'Telegram'"/>
                        <label>
                        TELEGRAM <br> ГЛУБОКАЯ АНАЛИТИКА
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'SQL-ready'"/>
                        <label>
                        SQL-READY <br> ВСЁ О МИРЕ IT
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'strudio'"/>
                        <label>
                        STRUDIO <br> САМОЕ НОВОЕ
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'cbsnews'"/>
                        <label>
                        CBSNEWS <br> ВЗГЛЯНИ ПО НОВОМУ
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'halyvaigr'"/>
                        <label>
                        HALYVAIGR <br> УВЛЕКАЕТ НА ВСЕ 100
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'the-guardion'"/>
                        <label>
                        THE-GUARDION <br> ЧТО НА ПОПУЛЯРНОМ
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'golang-interview'"/>
                        <label>
                        GOLANG-INTERVIEW <br> ВСЁ О GO
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'Pavel Durov'"/>
                        <label>
                        PAVEL DUROV <br> САМОЕ ГЕНИАЛЬНОЕ О ВСЁМ
                        </label>
                    </article>
                </form>
                </article>
                <article class="filters-optional">
                    <h3>КАТЕГОРИИ <br>ПОИСКА</h3>
                    <form class="form-categori" name="form_">
                        <section>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Спорт'"/>
                                <label>
                                СПОРТ
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Политика'"/>
                                <label>
                                ПОЛИТИКА
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Технологии'"/>
                                <label>
                                ТЕХНОЛОГИИ
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Наука'"/>
                                <label>
                                НАУКА
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Здоровье'"/>
                                <label>
                                ЗДОРОВЬЕ
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Общество'"/>
                                <label>
                                ОБЩЕСТВО
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Бизнес'"/>
                                <label>
                                БИЗНЕС
                                </label>
                            </article>
                        </section>
                        <section>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Развлечения'"/>
                                <label>
                                РАЗВЛЕЧЕНИЯ
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Игры'"/>
                                <label>
                                ИГРЫ
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Культура'"/>
                                <label>
                                КУЛЬТУРА
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Общество'"/>
                                <label>
                                ОБЩЕСТВО
                                </label>
                            </article>
                            <article>
                                <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Экономика'"/>
                                <label>
                                ЭКОНОМИКА
                                </label>
                            </article>
                        </section>
                    </form>
                    <section class="filters-reload">
                        <h3>ОбНОВЛЕНИЕ ЛЕНТЫ</h3>
                        <article>
                            <InputCheckBox @change-tags="(timeReload) => { $emit('addTimeReload', timeReload), addTimeReloadLocal(timeReload)}" :tag="1"/>
                            <label>
                                1 ЧАС
                            </label>
                        </article>
                        <article>
                            <InputCheckBox @change-tags="(timeReload) => { $emit('addTimeReload', timeReload), addTimeReloadLocal(timeReload)}" :tag="2"/>
                            <label>
                                2 ЧАСА
                            </label>
                        </article>
                        <article>
                            <InputCheckBox @change-tags="(timeReload) => {$emit('addTimeReload', timeReload), addTimeReloadLocal(timeReload)}" :tag="3"/>
                            <label>
                                3 ЧАСА
                            </label>
                        </article>
                        <article>
                            <InputCheckBox @change-tags="(timeReload) => {$emit('addTimeReload', timeReload), addTimeReloadLocal(timeReload)}" :tag="4"/>
                            <label>
                                4 ЧАСА
                            </label>
                        </article>
                        <article>
                            <InputCheckBox @change-tags="(timeReload) => {$emit('addTimeReload', timeReload), addTimeReloadLocal(timeReload)}" :tag="5"/>
                            <label>
                                5 ЧАСОВ
                            </label>
                        </article>
                        <article>
                            <InputCheckBox @change-tags="(timeReload) => {$emit('addTimeReload', timeReload), addTimeReloadLocal(timeReload)}" :tag="6"/>
                            <label>
                                6 ЧАСОВ
                            </label>
                        </article>
                        <p class="error" v-if="timeReload.length > 1">Выбрано более 1 промежутка времени</p>
                    </section>
                </article>
            </nav>
            <section class="filters-save">
                <button v-if="timeReload.length > 1" @click.prevent="$emit('filtrAdd')">Сохранить и продолжить <span>→</span></button>
            </section>
        </article>
    </section>
</template>

<style scoped lang="scss">
   
    .owerflou {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        position: absolute;
        top:0;
        left:0;
        background-color: rgba(0,0,0,0.7);
    }

    .filters-reload {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        gap:10px;

        >h3 {
            font-size: 6px;
            color:white;
        }

        >article {
            display: flex;
            flex-direction: row;
            justify-content: start;
            align-items: center;
            gap:10px;

            >label {
                font-size: 5px;
                color:white
            }
        }

        .error {
            color:red;
            font-size: 6px;
        }
    }

    

    .modal {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
        width: fit-content;
        box-sizing: border-box;
        background-color: #6A50D8;
        height: fit-content;
        border: none;
        padding: 40px;
        border-radius: 25px;

        >h2 {
          font-size: 12px;
          color:white;
        }

        >nav {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          gap:10px;
          padding: 20px;
          overflow-y: scroll;
          height: 500px;

          >article {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: start;
            gap:10px;

            >h3 {
              font-size: 6px;
              color:white;
              text-align: start;
              width: 100%;
            }

            >form {
              display: flex;
              flex-direction: column;
              justify-content: start;
              align-items: start;
              gap:10px;

              >article {
                    width: 100%;
                    display:flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: start;
                    gap:10px;

                    >label {
                        font-size: 6px;
                        color:white;
                    }
                }
              
            }


            >.form-categori {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                gap:10px;
                >section {
                    display: flex;
                    flex-direction: column;
                    justify-content: start;
                    align-items: start;
                    gap:10px;
                    width: 50%;

                    >article {
                        display:flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: start;
                        gap:10px;

                        >label {
                            font-size: 5px;
                            color:white;
                        }
                    }
                }
            }


          }
        }

        >.filters-save {
          width: 100%;

          >button {
            background-color: inherit;
            border: 1px solid white;
            font-size: 8px;
            padding: 10px 8px;
            color:white;
            border-radius:15px;
            text-align: start;
            >span {
              font-size: 16px;
              text-align: start;
            }
          }
        }
      }


      @media screen and (max-width:500px) {
        .modal {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
            width: fit-content;
            box-sizing: border-box;
            background-color: #6A50D8;
            height: fit-content;
            border: none;
            padding: 20px;
            border-radius: 25px;

            >h2 {
            font-size: 10px;
            color:white;
            }

            >nav {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: start;
            gap:10px;
            height: 400px !important;

            >article {
                display: flex;
                flex-direction: column;
                justify-content: start;
                align-items: start;
                gap:10px;

                >h3 {
                font-size: 6px;
                color:white;
                text-align: start;
                width: 100%;
                }

    
            }
            }

            >.filters-save {
            width: 100%;

                >button {
                    font-size: 6px !important;
                    >span {
                        font-size: 10px !important;
                    }
                }
            }
        }
      }
</style>