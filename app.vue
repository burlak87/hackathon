<script setup>

  const activeTags = ref([]),
        activeFilterPost = ref([]),
        appliedTags = ref([]);
  let statusAllPost = ref(true)

  
  const posts = [
    {
      id: new Date(),
      name: "111",
      isto: "TG",
      time: "2",
      description: "11111111111111111111111111111111",
      link: "https://google.com/",
      tag: "TG"
    },
    {
      id: new Date(),
      name: "222",
      isto: "TG",
      time: "2",
      description: "11111111111111111111111111111111",
      link: "https://google.com/",
      tag: "WEB"
    },
    {
      id: new Date(),
      name: "333",
      isto: "TG",
      time: "2",
      description: "11111111111111111111111111111111",
      link: "https://google.com/",
      tag: "NEWSAPI"
    },
    {
      id: new Date(),
      name: "444",
      isto: "TG",
      time: "2",
      description: "11111111111111111111111111111111",
      link: "https://google.com/",
      tag: "TASS"
    },
    {
      id: new Date(),
      name: "555",
      isto: "TG",
      time: "2",
      description: "11111111111111111111111111111111",
      link: "https://google.com/",
      tag: "RIA"
    },
    {
      id: new Date(),
      name: "111",
      isto: "TG",
      time: "2",
      description: "11111111111111111111111111111111",
      link: "https://google.com/",
      tag: "TG"
    },
  ]

  async function allPosts() {
    //let promis = await fetch("http://localhost:5000/posts")
    //posts.value = JSON.parse(promis.json())
  }

  onMounted(() => {
    allPosts()
  })
  

  function addTag(el) {
    if(activeTags.value.indexOf(el) == -1) {
      activeTags.value.push(el)
    } else {
      activeTags.value.splice(activeTags.value.indexOf(el), 1)
    }
    
  }

  function filtration() {
    
    if(!activeTags.value.length) {
      statusAllPost.value = true
      appliedTags.value = []
    } else {
      statusAllPost.value = false
      appliedTags.value = [... activeTags.value]
    }

    activeFilterPost.value = []

    activeTags.value.forEach((tag) => {
      posts.forEach((post) => {
        if(tag == post.tag) {
          activeFilterPost.value.push(post)
        }
      })
    })
  }
</script>


<template>
    <header>
      <h1>HACKATHON <span>NEWS ///</span></h1>
      <input type="text" placeholder="Введите ключевые слова или фразы...">
    </header>
    <main>
      <section class="title">
        <h1>Hackathon</h1>
        <h2>NEWS</h2>
      </section>
      <section class="content">
        <article class="filters">
          <h2>ФИЛЬТРЫ И <br>НАСТРОЙКИ</h2>
          <nav>
            <article class="filters-main">
              <h3>ВЫБЕРИТЕ <br>ИСТОЧНИКИ <br>НОВОСТЕЙ</h3>
              <form name="form_">
                
                <article>
                    <InputCheckBox @change-tags="addTag" :tag="'NEWSAPI'" />
                    <label>
                      NEWSAPI <br>МЕЖДУНАРОДНЫЕ НОВОСТИ
                    </label>
                </article>
                <article>
                    <InputCheckBox @change-tags="addTag" :tag="'RIA'"/>
                    <label>
                      РИА НОВОСТИ <br>ОФИЦИАЛЬНАЯ ХРОНИКА
                    </label>
                </article>
                <article>
                    <InputCheckBox @change-tags="addTag" :tag="'TASS'"/>
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
                    <InputCheckBox @change-tags="addTag" :tag="'TG'"/>
                    <label>
                      ТЕЛЕГРАМ-КАНАЛЫ <br>ЖИВИЕ ОБСУЖДЕНИЯ
                    </label>
                </article>
                <article>
                    <InputCheckBox @change-tags="addTag" :tag="'WEB'"/>
                    <label>
                     ВЕБ-САЙТЫ <br>ПЕРВОИСТОЧНИКИ
                    </label>
                </article>
              </form>
            </article>
          </nav>
          <section class="filters-save">
            <button @click="filtration">Сохранить и продолжить <span>→</span></button>
          </section>
        </article>
        <article class="news">
          <section class="news-title">
            <h2>свежие новости</h2>
            <article class="news-filters">
              <p>выбранные фильтры</p>
              <section v-if="!statusAllPost">
                <p v-for="i in appliedTags">{{ i }}</p>
              </section>
            </article>
          </section>
          <section v-if="statusAllPost" class="news-list" >
            <NewsBlock v-for="i in posts"  :key="i.id" :obj="i"/>
          </section>
          <section v-else class="news-list" >
            <NewsBlock v-for="i in activeFilterPost"  :key="i.id" :obj="i"/>
          </section>
        </article>
      </section>
    </main>
    <footer>
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
            <p><img src="/foto/mail.png" alt="EMail"> <span>MAIL:</span> email@mail.ru</p>
          </section>
      </section>
    </footer>
</template>

<style  lang="scss">


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
        color:#6A50D8;
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
        color:rgba(#000000, 0.36);
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
    gap:50px;

    .title {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;


      h1 {
        font-size: 64px;
        color:black;
        width: 70%;
        text-align: start;
      }

      h2 {
        font-size: 96px;
        color:white;
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
        gap: 50px;
        width: fit-content;
        box-sizing: border-box;
        background-color: #6A50D8;
        height: fit-content;
        
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
          gap:50px;

          >article {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: start;
            gap:20px;

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
              gap:15px;

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
            gap:20px;

            >p {
              font-size: 10px;
              
            }
            

            >section {
              display: flex;
              flex-direction: row;
              width: 50%;
              align-items: start;
              justify-content: start;
              gap:30px;

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
          justify-content: start;
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
          gap:50px;
          padding: 50px 00px;

          
        }

      }
    }
  }


  footer {
    background-color: #252525;
    padding: 50px 80px;
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: center;
    gap:100px;

    >.footer-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap:50px;
      width: 50%;

      >article {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        text-align: start;
        width: 100%;
        gap:20px;

        >h1 {
          font-size: 12px;
          color:white;
          >span {
            color:#6A50D8
          }
        }

        >p {
          font-size: 9px;
          color:white;

          >span {
            color:#6A50D8;
          }
        }

        >section {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          gap:20px;
        }
      }

      >.footer-info__article-copy {
         >p {
          font-size: 9px;
          color:white;
          

          >span:first-child {
            color:#6A50D8;
            font-size: 20px;
          }

          >span {
            color:#6A50D8;
          }
        }
      }

    }

    .footer-contact {
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: start;
      gap:40px;
      width: 50%;

      >h2 {
        font-size: 12px;
        color:white;
      }



      >section {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        gap:15px;

        >p {
          font-size: 9px;
          color:white;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap:10px;

          >span {
            color:#6A50D8
          }

          >img {
            width: 20px;
            height: 20px;
          }
        }
      }
    }

  }
</style>
