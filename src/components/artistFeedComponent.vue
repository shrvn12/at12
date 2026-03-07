<template>
    <div
        ref="queueContainer"
        class="queueContainer"
        style=""
    >
    <v-list style="background-color: transparent; overflow-y: scroll;">
        <v-list-item
            v-for="(artist, index) in artists"
            :key="index"
            style="border: 1px solid transparent;"
        >
          <div class="artistCard" :class="artistId == artist.id ? 'highlight' : ''" @click="$router.push(`/artist/${artist.id}`)">
            <img :src="artist.thumbnail" style="width: 3.3vw; border-radius: 50%; margin-left: 1%; display: block;" alt="">
            <p style="color: white; margin-left: 1vw; font-size: small;">{{ artist.name }}</p>
          </div>
        </v-list-item>
    </v-list>
    
    </div>
</template>

<script>

// import { EventBus } from '@/eventBus';
import { useToast } from 'vue-toastification';
import { useQueueStore } from '../stores/queue';
import { useLyricsStore } from '../stores/lyrics';

export default {
  name: "artistFeedComponent",

  setup() {
    const queueStore = useQueueStore();
    const lyricsStore = useLyricsStore();
    return { queueStore, lyricsStore };
  },

  data() {
    return {
        toast: useToast(),
        artists: [
            {
                name: "Alka Yagnik",
                id: "UCLH5ojAg1XIyxcOCazK4n-Q",
                thumbnail: "https://lh3.googleusercontent.com/_wPXKRCH5rAX8AK1kJZ1bNhSpNyyEgBRNmREdPmLbvTy3sX_ldiKMRYFc5uChygV_KRx_SDrH1KgUifk=w175-h175-p"
            },
            {
                name: "Udit Narayan",
                id: "UCrYczeBh8tcxLLAgn8m2wWQ",
                thumbnail: "https://lh3.googleusercontent.com/coesV4OVEVkua3_wJG-2BVvTc95yHF9sS1W6mOAtl4-vvTjQb250Hy_nVlfvudmEugb7_k05vhY9aJm4=w80-h80-p"
            },
            {
                name: "Arijit Singh",
                id: "UCtFOW7jJXChfFNoucRFqRmw",
                thumbnail: "https://lh3.googleusercontent.com/W_yOqnKSDYyeVOY_AsXhuAtb6rW3vCL3GtJ9DA1GxWOrJfyeSOqzvTv_TkFHijdkVPXWutASBlRFPg=w80-h80-p"
            },
            {
                name: "Kumar Sanu",
                id: "UCyhq3s9caQkOl-lY1laVC5w",
                thumbnail: "https://lh3.googleusercontent.com/cPvYaP4ByG-i7fUE-dKrjMgaNL8v3hC93ErP6meKnltvRuzxo-DINLQkTtvjfC6hVnzRMlnJEb9n3uM=w80-h80-p"
            },
            {
                name: "Shreya Ghoshal",
                id: "UCcL78rRNuUQ8t7Dx4CLmRqA",
                thumbnail: "https://lh3.googleusercontent.com/a-/ALV-UjVooPUaK5s24CNCmDjwzaeoV6C8EhKA-BIFwygOGaF_VHDiBd0=w80-h80-p"
            },
            {
              name: "Sonu Nigam",
              id: "UCDYFISYJx2tSc6cyhvx0N5Q",
              thumbnail: "https://lh3.googleusercontent.com/iWH_XSIO8yZvIqz8vxkwC9BjzGM4giAhR69Z6LZ0t8Rp79ASNFVwpwHZWOyyo94B_jsXl8HtFueMgMA=w80-h80-p"
            },
            {
              name: "Lata Mangeshkar",
              id: "UCOq_phR9Fi_eUwNweVXlQIw",
              thumbnail: "https://lh3.googleusercontent.com/aOdQY2mAYeneChSYXR-XM8Jmar12sSGavWQjNXJcoQnoxe6iri4ju4GuJKpyxDoCk3813ROgTBD72Gg=w80-h80-p"
            },
            {
              name: "Pritam",
              id: "UCFrjzbol2Zy-FaKaCIKIDVA",
              thumbnail: "https://yt3.googleusercontent.com/sjGMYJQ1J3FZEIBsMYUztMjjYOM4-NJ24CjmIHqxTWCxAM1YgjL-d_17u7_PRhTouOwwAjbu-2x5S6I=w80-h80-p"
            },
            {
              name: "Sunidhi Chauhan",
              id: "UCOy7uPsjass2DCY4a_UUp-Q",
              thumbnail: "https://lh3.googleusercontent.com/_c102EBASHERqDnrU32iygceCB0ItZy5PSeR6rvnKEusmQWNZhZRcp_xdlZHS578a82QVSPKfOyrzn8=w80-h80-p"
            },
            {
              name: "Khesari Lal Yadav",
              id: "UCJfeUWkrU4JwIJfP-usd-_w",
              thumbnail: "https://lh3.googleusercontent.com/rdhk-_2UHeXOqem15INGphwJQBGYj3JkeckFYUZVPoL5aVPm3TS730uKayljYiuahRXolePwSsyWO8KI=w80-h80-p"
            },
            {
              name: "Masoom Sharma",
              id: "UCTyJBpNC7mdjCT5aF5oulww",
              thumbnail: "https://yt3.googleusercontent.com/7qK3_qtRlpQ4zmpSNp3cneXzIv0JxO1jW3xd5ZPbI2tLkIruF4IQ-95-YI3zs6xYNVRDvbG9U3BDlTY=w80-h80-p"
            },
            {
              name: "Yo Yo Honey Singh",
              id: "UC1KonH1j8WMhc5cT6Bp7NtA",
              thumbnail: "https://lh3.googleusercontent.com/Ss_NEfGmfpwXCiuoNxiKxWAoU3M484SwZ4UmahATX7KwOqIaoqTyESuNyZV3fzJm25bmjtfSUxsIFI8=w80-h80-p"
            }
        ],
    };
  },

  computed: {
    artistId(){
      return this.$route.params.artistId;
    }
  },

  methods: {

  },
  activated(){

  },
  mounted() {
    console.log(process.env.VUE_APP_PROD_URL);
  },

  beforeUnmount() {
    
  },

  watch:{
    
  }
};
</script>

<style scoped>
.queueContainer{
  position: absolute;
  width: 23%;
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: none;
  border: 0px solid;
  -ms-overflow-style: none;
  z-index: 1;
}

.artistCard{
  display: flex;
  padding: 3%;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 50px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  color: white;
  transition: background 0.3s ease;
}

.artistCard:hover {
  background: rgba(255, 255, 255, 0.1);
}

.highlight{
  border: 1px solid white;
}

@media screen and (max-width: 675px) {
  .queueContainer {
    width: 100%;
    height: 80vh;
    z-index: 2;
    background-color: #000;
  }
  
}
</style>