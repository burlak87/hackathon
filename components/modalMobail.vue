<script setup>
    onMounted(() => {
        document.body.style.overflow="hidden"
    })

    onBeforeUnmount(() => {
        document.body.style.overflow="scroll"
    })
</script>

<template>
    <section @click="$emit('drop-modal')" class="owerflou">
        <article @click.stop class="modal">
            <h2>ФИЛЬТРЫ И <br>НАСТРОЙКИ</h2>
            <nav>
                <article class="filters-main">
                <h3>ВЫБЕРИТЕ <br>ИСТОЧНИКИ <br>НОВОСТЕЙ</h3>
                <form name="form_">
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'NEWSAPI'" />
                        <label>
                        NEWSAPI <br>МЕЖДУНАРОДНЫЕ НОВОСТИ
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'RIA'"/>
                        <label>
                        РИА НОВОСТИ <br>ОФИЦИАЛЬНАЯ ХРОНИКА
                        </label>
                    </article>
                    <article>
                        <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'TASS'"/>
                        <label>
                        ТАСС <br> ГЛУБОКАЯ АНАЛИТИКА
                        </label>
                    </article>
                </form>
                </article>
                <article class="filters-optional">
                    <h3>ДОПОЛНИТЕЛЬНЫЕ <br>ИСТОЧНИКИ</h3>
                    <form name="form_">
                        <article>
                            <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'TG'"/>
                            <label>
                            ТЕЛЕГРАМ-КАНАЛЫ <br>ЖИВИЕ ОБСУЖДЕНИЯ
                            </label>
                        </article>
                        <article>
                            <InputCheckBox @change-tags="(sours) => {$emit('addSours', sours)}" :tag="'WEB'"/>
                            <label>
                            ВЕБ-САЙТЫ <br>ПЕРВОИСТОЧНИКИ
                            </label>
                        </article>
                    </form>
                </article>
                <article class="filters-optional">
              <h3>КАТЕГОРИИ <br>ПОИСКА</h3>
              <form name="form_">
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
                    <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Безопасность'"/>
                    <label>
                     БЕЗОПАСНОСТЬ
                    </label>
                </article>
                <article>
                    <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Война'"/>
                    <label>
                     Боевые действия
                    </label>
                </article>
                <article>
                    <InputCheckBox @change-tags="(categori) => {$emit('addCategori', categori)}" :tag="'Экономика'"/>
                    <label>
                     Экономика
                    </label>
                </article>
              </form>
            </article>
            </nav>
            <section class="filters-save">
                <button @click.prevent="$emit('filtrAdd')">Сохранить и продолжить <span>→</span></button>
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
    .modal {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 30px;
        width: fit-content;
        box-sizing: border-box;
        background-color: #6A50D8;
        height: fit-content;
        border: none;
        padding: 40px;
        border-radius: 25px;

        >h2 {
          font-size: 16px;
          color:white;
        }

        >nav {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          gap:30px;

          >article {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: start;
            gap:15px;

            >h3 {
              font-size: 10px;
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
                display:flex;
                flex-direction: row;
                align-items: center;
                justify-content: start;
                gap:10px;

                >label {
                  font-size: 8px;
                  color:white;
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
            font-size: 13px;
            color:white;
            }

            >nav {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: start;
            gap:30px;

            >article {
                display: flex;
                flex-direction: column;
                justify-content: start;
                align-items: start;
                gap:10px;

                >h3 {
                font-size: 8px;
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
      }
</style>