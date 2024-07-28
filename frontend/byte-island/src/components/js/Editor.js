import { mapMutations } from "vuex";
import Shop from './Shop'
import Inventory from './Inventory'

export default {
    data() {
      return {
            editorView: "editor"
        };
    },
    async created() {
      
    },
    computed: {

    },
    mounted() {
        
    },
    methods: {
      ...mapMutations(['setIsInInventory']),
        toEditorView(view) {
          this.setIsInInventory(false);
          this.editorView = view;
          if(this.editorView==='inventory') {
            this.setIsInInventory(true);
          }
        }
    },
    components: {
      Shop,
      Inventory
    },
  };