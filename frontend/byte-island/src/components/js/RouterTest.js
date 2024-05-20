export default {
    data() {
      return {
        testVal: 0
      };
    },
    async created() {
      this.testVal += 1;
    },
    computed: {
      
    },
    mounted() {
        this.testVal += 1;
    },
    methods: {
      getVal() {
        return this.testVal;
      },
      valInc() {
        this.testVal += 1;
      }
    },
    components: {
      
    },
  };