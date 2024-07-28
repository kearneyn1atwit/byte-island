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
      ...mapMutations(['setSelectedBlock']),
        toEditorView(view) {
          this.setSelectedBlock(null);
          this.editorView = view;
        }
    },
    components: {
      Shop,
      Inventory
    },
  };