<script setup>

const activeTags = ref([[], [], []]),
  appliedTags = ref([]);
let modalStatus = ref(false)


const posts = ref([])

async function allPosts() {
  await fetch(" http://localhost:3001/api-v1/news", {
    method: "GET",
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
  .then((result) => { posts.value = JSON.stringify(result.json()) }, error => { console.error(error.message) })
}

console.log(JSON.stringify(posts))

function urlFiltration(sours, categori, urlOld) {
  let filters = []
  filters.push(sours.length > 0 ? "?source=" + sours.join(",") : "")
  filters.push(categori.length > 0 ? "category=" + categori.join(",") : "")
  return sours.length > 0 && categori.length > 0 ? urlOld + filters.join("&") : sours.length > 0 && categori.length == 0 ? urlOld + filters.join("") : sours.length == 0 && categori.length > 0 ? urlOld + filters.join("?") : ""
}

async function filterPost(tags) {
  let url = "http://localhost:3001/api-v1/news"
  let urlFilters = urlFiltration(tags[0], tags[1], url)
  console.log(urlFilters)
  await fetch(urlFilters, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
    .then(result => { posts.value = JSON.parse(result.json()) }, error => { console.error(error.message) })



}

onMounted(() => {
  allPosts()
})


function addSours(el) {
  if (activeTags.value[0].indexOf(el) == -1) {
    activeTags.value[0].push(el)
  } else {
    activeTags.value[0].splice(activeTags.value[0].indexOf(el), 1)
  }

}

function addTimeReload(el) {
  if(activeTags.value[2].indexOf(el) == -1) {
    activeTags.value[2].push(el)
  } else {
    activeTags.value[2].splice(activeTags.value[2].indexOf(el), 1)
  }
}

function addCategori(el) {
  if (activeTags.value[1].indexOf(el) == -1) {
    activeTags.value[1].push(el)
  } else {
    activeTags.value[1].splice(activeTags.value[1].indexOf(el), 1)
  }

}

function filtration() {
  if (modalStatus.value) {
    modalStatus.value = false
  }

  if (!activeTags.value[0].length && !activeTags.value[1].length) {
    allPosts()
    appliedTags.value = []
    return 0;
  } else {
    appliedTags.value = [...activeTags.value[0]]
    appliedTags.value.push(...activeTags.value[1])
    filterPost(activeTags.value)
  }
}



function openModalFilters() {

  if (modalStatus.value) {
    modalStatus.value = false
  } else {
    modalStatus.value = true
  }
}
</script>


<template>

  <ModalMobail v-if="modalStatus" @filtr-add="filtration" @drop-modal="modalStatus = !modalStatus"
    @add-categori="addCategori" @add-sours="addSours"  @add-time-reload="addTimeReload"/>
  <header>
    <h1>HACKATHON <span>NEWS ///</span></h1>
    <input type="text" placeholder="Введите ключевые слова или фразы...">
  </header>
  <main>
    <section class="title">
      <h1>Hackathon</h1>
      <h2>NEWS</h2>
    </section>
    <section class="filter-button">
      <button @click="openModalFilters">ФИЛЬТРЫ И НАСТРОЙКИ</button>
    </section>
    <section class="content">
      <article class="filters">
        <h2>ФИЛЬТРЫ И <br>НАСТРОЙКИ</h2>
        <nav>
          <article class="filters-main">
            <h3>ВЫБЕРИТЕ <br>ИСТОЧНИКИ <br>НОВОСТЕЙ</h3>
            <form name="form_">

              <article>
                <InputCheckBox @change-tags="addSours" :tag="'NewsAPI'" />
                <label>
                  CNN <br>МЕЖДУНАРОДНЫЕ НОВОСТИ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'Telegram'" />
                <label>
                  TELEGRAM <br> САМОЕ ГОРЯЧЕЕ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'SQL-ready'" />
                <label>
                  SQL-READY <br> ВСЁ О МИРЕ IT
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'strudio'" />
                <label>
                  STRUDIO <br> САМОЕ НОВОЕ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'cbsnews'" />
                <label>
                  CBSNEWS <br> ВЗГЛЯНИ ПО НОВОМУ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'halyvaigr'" />
                <label>
                  HALYVAIGR <br> УВЛЕКАЕТ НА ВСЕ 100
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'the-guardion'" />
                <label>
                  THE-GUARDION <br> ЧТО НА ПОПУЛЯРНОМ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'golang-interview'" />
                <label>
                  GOLANG-INTERVIEW <br> ВСЁ О GO
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addSours" :tag="'Pavel Durov'" />
                <label>
                  PAVEL DUROV <br> САМОЕ ГЕНИАЛЬНОЕ О ВСЁМ
                </label>
              </article>
            </form>
          </article>
          <article class="filters-optional">
            <h3>КАТЕГОРИИ <br>ПОИСКА</h3>
            <form name="form_">
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Спорт'" />
                <label>
                  СПОРТ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Политика'" />
                <label>
                  ПОЛИТИКА
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Технологии'" />
                <label>
                  ТЕХНОЛОГИИ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Наука'" />
                <label>
                  НАУКА
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Здоровье'" />
                <label>
                  ЗДОРОВЬЕ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Общество'" />
                <label>
                  ОБЩЕСТВО
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Бизнес'" />
                <label>
                  БИЗНЕС
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Развлечения'" />
                <label>
                  РАЗВЛЕЧЕНИЯ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Игры'" />
                <label>
                  ИГРЫ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Культура'" />
                <label>
                  КУЛЬТУРА
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Общество'" />
                <label>
                  ОБЩЕСТВО
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addCategori" :tag="'Экономика'" />
                <label>
                  ЭКОНОМИКА
                </label>
              </article>
            </form>
            <section class="filters-reload">
              <h3>ОбНОВЛЕНИЕ <br>ЛЕНТЫ</h3>
              <article>
                <InputCheckBox @change-tags="addTimeReload" :tag="1" />
                <label>
                  1 ЧАС
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addTimeReload" :tag="2" />
                <label>
                  2 ЧАСА
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addTimeReload" :tag="3" />
                <label>
                  3 ЧАСА
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addTimeReload" :tag="4" />
                <label>
                  4 ЧАСА
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addTimeReload" :tag="5" />
                <label>
                  5 ЧАСОВ
                </label>
              </article>
              <article>
                <InputCheckBox @change-tags="addTimeReload" :tag="6" />
                <label>
                  6 ЧАСОВ
                </label>
              </article>
              <p class="error" v-if="activeTags[2].length > 1">Вы выбрали больше 1 временного промежутка</p>
            </section>
          </article>
        </nav>
        <section class="filters-save">
          <button v-if="activeTags[2].length > 1" @click="filtration">Сохранить и продолжить <span>→</span></button>
        </section>
      </article>
      <article class="news">
        <section class="news-title">
          <h2>свежие новости</h2>
          <article class="news-filters">
            <p>выбранные фильтры</p>
            <section>
              <p v-for="i in appliedTags">{{ i }}</p>
            </section>
          </article>
        </section>
        <section class="news-list">
          <NewsBlock v-for="i in posts" :key="i.id" :obj="i" />
        </section>
      </article>
    </section>
  </main>
  <footer>
    <article class="footer-main">
      <section class="footer-info">
        <article>
          <h1>HACKATHON <span>NEWS</span></h1>
          <p>Умный агрегатор новостей с <span>AI</span>-анализом</p>
        </article>
        <article class="footer-info__article-copy">
          <p><span class="copy">©</span> 2025 Команда <span>BlueScreenDead</span></p>
        </article>
      </section>
      <section class="footer-contact">
        <h2>НАШИ КОНТАКТЫ</h2>
        <section>
          <p><img src="/foto/telegram.png" alt="Telegram"> <span>TELEGRAM:</span> @m0rt1mmin3nte</p>
          <p><img src="/foto/mail.png" alt="EMail"> <span>MAIL:</span> burlakovfedor87@gmail.com</p>
        </section>
      </section>
    </article>
    <article class="footer-warning">
      <p>Мы не уверены, что данный хостинг-провайдер надёжен. Если возникнут проблемы пишите нам!</p>
    </article>
  </footer>
</template>

<style lang="scss">
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 15px 80px;

  h1 {
    font-size: 15px;
    font-weight: 900;

    >span {
      color: #6A50D8;
      font-weight: 900;

    }
  }

  input {
    background-color: inherit;
    border: 3px solid black;
    border-radius: 20px;
    padding: 15px 40px;
    font-size: 5px;
    background-image: url("/foto/search.png");
    background-repeat: no-repeat;
    background-size: 20px;
    background-attachment: scroll;
    background-position-x: 95%;
    background-position-y: center;
    width: 300px;

    &::placeholder {
      font-size: 5px;
      color: rgba(#000000, 0.36);
      font-weight: 500;
    }
  }

}

main {
  margin: 0;
  padding: 100px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 50px;

  .filter-button {
    display: none;
  }

  .title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;


    h1 {
      font-size: 64px;
      color: black;
      width: 70%;
      text-align: start;
    }

    h2 {
      font-size: 96px;
      color: white;
      -webkit-text-stroke: 2px #6A50D8;
      width: 70%;
      text-align: end;
    }
  }

  .content {
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
    gap: 100px;
    width: 100%;

    .filters {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 20px;
      width: fit-content;
      box-sizing: border-box;
      background-color: #6A50D8;
      height: fit-content;

      padding: 40px;
      border-radius: 25px;

      >h2 {
        font-size: 12px;
        color: white;
      }

      >nav {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        gap: 20px;

        .filters-reload {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          gap:10px;

          >h3 {
              font-size: 8px;
              color:white;
          }

          >article {
              display: flex;
              flex-direction: row;
              justify-content: start;
              align-items: center;
              gap:10px;

              >label {
                  font-size: 6px;
                  color:white
              }
          }

          .error {
            color:red;
            font-size: 6px;
            text-align: center;
          }
        }

        >article {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          gap: 20px;

          >h3 {
            font-size: 8px;
            color: white;
            text-align: start;
            width: 100%;
          }

          >form {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: start;
            gap: 15px;

            >article {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: start;
              gap: 10px;

              >label {
                font-size: 6px;
                color: white;
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
          font-size: 6px;
          padding: 10px 8px;
          color: white;
          border-radius: 15px;
          text-align: start;

          >span {
            font-size: 13px;
            text-align: start;
          }
        }
      }
    }

    .news {
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: start;
      width: 60%;
      height: max-content;

      >.news-title {
        text-align: start;

        >h2 {
          font-size: 24px;
          padding: 0px 0px 30px 0px;
        }

        >.news-filters {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          gap: 20px;

          >p {
            font-size: 10px;

          }


          >section {
            display: flex;
            flex-direction: row;
            width: 50%;
            align-items: center;
            justify-content: start;
            flex-wrap: wrap;
            width: 100%;
            gap: 30px;

            >p {
              font-size: 6px;
              padding: 10px 15px;
              background-color: inherit;
              border: 2px solid black;
              border-radius: 100px;
            }
          }
        }
      }

      >.news-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        gap: 50px;
        padding: 50px 00px;
        background-image: url("./public/foto/BackgroundImgNews.png");
        background-repeat: repeat-y;
        background-position: center;
        background-size: auto;
        background-attachment: scroll;
        word-break: break-all;
      }

    }
  }
}


footer {
  background-color: #252525;
  padding: 50px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 100px;

  >.footer-main {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-between;

    >.footer-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 50px;
      width: 50%;

      >article {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        text-align: start;
        width: 100%;
        gap: 20px;

        >h1 {
          font-size: 12px;
          color: white;

          >span {
            color: #6A50D8
          }
        }

        >p {
          font-size: 9px;
          color: white;

          >span {
            color: #6A50D8;
          }
        }

        >section {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          gap: 20px;
        }
      }

      >.footer-info__article-copy {
        >p {
          font-size: 9px;
          color: white;


          >span:first-child {
            color: #6A50D8;
            font-size: 20px;
          }

          >span {
            color: #6A50D8;
          }
        }
      }

    }

    .footer-contact {
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: start;
      gap: 40px;
      width: 50%;

      >h2 {
        font-size: 12px;
        color: white;
      }



      >section {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        gap: 15px;

        >p {
          font-size: 9px;
          color: white;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 10px;

          >span {
            color: #6A50D8
          }

          >img {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
  }

  >.footer-warning {
    width: 100%;
    box-sizing: border-box;

    >p {
      font-size: 10px;
      text-align: center;
      width: 100%;
      color: #6A50D8;
    }
  }



}

@media screen and (max-width:1500px) {
  .filters-save {
    width: 100%;

    >button {
      background-color: inherit;
      border: 1px solid white;
      font-size: 6px !important;
      padding: 10px 8px;
      color: white;
      border-radius: 15px;
      text-align: start;

      >span {
        font-size: 10px !important;
        text-align: start;
      }
    }
  }
}


@media screen and (max-width:1350px) {
  main {
    padding: 100px 20px !important;
  }

  .title {
    h1 {
      font-size: 45px !important;
    }

    h2 {
      font-size: 60px !important;
    }
  }

  .filter-button {
    display: none !important;
  }

  .news-title {

    >h2 {
      font-size: 20px !important;

    }
  }

  .filters {
    label {
      font-size: 6px !important;
    }
  }

  header {
    h1 {
      font-size: 12px !important;
    }
  }

  .filters-save {
    >button {
      font-size: 8px !important;
      text-align: center !important;

      >span {
        display: none !important;
      }
    }
  }
}

@media screen and (max-width:1000px) {
  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 15px 40px;
  }

  .news-filters {
    >section {
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;

    }
  }

  .filter-button {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;

    >button {
      background-color: #6A50D8;
      color: white;
      font-size: 15px;
      border: none;
      border-radius: 100px;
      padding: 15px 30px;
    }
  }

  .filters {
    display: none !important;
  }

  .title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;


    h1 {
      width: 100% !important;
    }

    h2 {
      width: 100% !important;
    }
  }

  .content {
    justify-content: center !important;

  }

  .news-title {
    width: 100% !important;

    >h2 {
      text-align: center !important;
    }

    >.news-filters {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 20px !important;
      text-align: center !important;
      width: 100% !important;
    }
  }
}

@media screen and (max-width:840px) {
  .title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;


    h1 {
      width: 100% !important;
      text-align: center !important;
      font-size: 30px !important;
    }

    h2 {
      width: 100% !important;
      text-align: center !important;
      font-size: 40px !important;
    }
  }

  .news-list {
    background-image: none !important;
  }

  .footer-main {
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 50px !important;
  }

  footer {
    padding: 50px 40px !important;
    gap: 40px !important;

    .footer-info {
      width: 100% !important;
      gap: 30px !important;

      >article {
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;

        >h1 {
          font-size: 10px !important;
        }

        >p {
          font-size: 6px !important;
          text-align: center;
        }
      }

      .footer-info__article-copy {
        >p {
          font-size: 6px !important;


          >.copy {
            font-size: 15px !important;
          }
        }


      }

    }

    .footer-contact {

      >h2 {
        font-size: 10px !important;
        text-align: center !important;
        width: 100% !important;
      }

      >section {
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;

        >p {
          font-size: 6px !important;
        }
      }
    }
  }
}


@media screen and (max-width:600px) {
  .footer-main {
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 40px !important;
  }

  .footer-contact {
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;

    >section {
      justify-content: center !important;
      align-items: center !important;
    }
  }

  .footer-info {

    width: 100% !important;

  }

  .title {
    h1 {
      font-size: 20px !important;
    }

    h2 {
      font-size: 30px !important;
    }

  }

  main {
    padding: 50px 15px !important;
  }

  header {
    padding: 15px 20px !important;

    h1 {
      font-size: 10px !important;
    }

    input {
      width: 200px !important;

      >&::placeholder {
        font-size: 3px !important;
      }
    }
  }

  .news-title {

    >h2 {
      font-size: 10px !important;
      text-align: center !important;
    }
  }

  .news-filters {
    >p {
      font-size: 6px !important;
    }
  }
}
</style>
