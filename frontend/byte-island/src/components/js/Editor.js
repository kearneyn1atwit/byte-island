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
        toEditorView(view) {
          this.editorView = view;
        }
    },
    components: {
      Shop,
      Inventory
    },
  };