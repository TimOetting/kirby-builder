<template>
  <k-field 
    :label="label"	
    class="kBuilder"
    :class="'kBuilder--col-' + columnsCount"
  >
    <k-draggable 
      class="kBuilder__blocks k-grid" 
      @update="onBlockMoved"
      @add="onBlockAdded"
      @remove="onBlockRemoved"
      @start.native="onStartDrag"
      :list="blocks"
      :end="onDragEnd" 
      :move="onMove"
      :options="draggableOptions"
    >
      <k-column 
        class="kBuilder__column"
        :width="columnWidth"
        v-for="(block, index) in blocks" 
        :key="block.uniqueKey" 
      >
        <div 
          class="kBuilder__inlineAddButton"
          :class="{'kBuilder__inlineAddButton--horizontal': (columnsCount == 1), 'kBuilder__inlineAddButton--vertical': (columnsCount > 1)}"
          @click="onClickAddBlock(index)"
        ></div>
        <builder-block 
          :page-id="pageId" 
          :page-uid="pageUid" 
          :encoded-page-id="encodedPageId" 
          :block="block" 
          :index="index"
          :columns-count="columnsCount"
          :show-preview.sync="block.showPreview" 
          :styles="cssContents[block.blockKey]"
          :script="jsContents[block.blockKey]"
          :parentPath="path"
          @input="onBlockInput" 
          @clone="cloneBlock"
          @delete="deleteBlock"
        />
        <div 
          v-if="(columnsCount % index == 0 && columnsCount > 1)"
          class="kBuilder__inlineAddButton kBuilder__inlineAddButton--vertical kBuilder__inlineAddButton--after"
          @click="onClickAddBlock(index + 1)"
        ></div>
      </k-column >
      <k-column :width="columnWidth" v-if="!max || blockCount < max">
        <k-button 
          icon="add" 
          @click="onClickAddBlock()"
          class="kBuilder__addButton"
        >
          {{addBlockButtonLabel}}
        </k-button>
      </k-column>
    </k-draggable>
    <k-dialog 
      ref="dialog" 
      class="kBuilder__dialog"
      @open="onOpenDialog"
      @close="onCloseDialog"
    >
      <k-list>
        <k-list-item
          class="kBuilder__addBlockButton"
          v-for="(value, key) in fieldsets" 
          :key="key" 
          :text="value.label"   
          @click="addBlock(key)"
        />
      </k-list>
    </k-dialog>
  </k-field>
</template>

<script>
import BuilderBlock from "./BuilderBlock.vue";
export default {
  props: {    
    counter: [Boolean, Object],
    disabled: Boolean,
    endpoints: Object,
    help: String,
    input: [String, Number],
    name: [String, Number],
    required: Boolean,
    type: String,
    value: String,
    fieldsets: Object,
    columns: Number,
    max: Number,
    label: String,
    preview: Object,
    pageId: String,
    pageUid: String,
    encodedPageId: String,
    cssUrls: String,
    jsUrls: String,
    parentPath: String
  },
  components: { BuilderBlock },
  mounted() {
    for (const [fieldSetKey, cssUrl] of Object.entries(this.cssUrls)) {
      fetch(cssUrl.replace(/^\/+/g, ''))//regex removes leading slashes
      .then((res) => {
        return res.text();
      })
      .then((res) => {
        this.$set(this.cssContents, fieldSetKey, res)
      })
    }
    for (const [fieldSetKey, jsUrls] of Object.entries(this.jsUrls)) {
      fetch(jsUrls.replace(/^\/+/g, ''))//regex removes leading slashes
      .then((res) => {
        return res.text();
      })
      .then((res) => {
        this.$set(this.jsContents, fieldSetKey, res)
      })
    }
    if (this.value) {
      this.value.forEach((block, index) => {
        let fieldSet = this.fieldsets[block._key]
        this.blocks.push(this.newBlock(fieldSet, block._key, block, index))
      });
      this.lastUniqueKey = this.value.length
    }
  },
  data() {
    return {
      blocks: [],
      toggle: true,
      targetPosition: null,
      lastUniqueKey: 0,
      cssContents: {},
      jsContents: {},
      dialogOpen: false
    }
  },
  computed: {
    val() {
      return this.blocks.map(block => block.content)
    },
    path() {
      return (this.parentPath) ? `${this.parentPath}+${this.name}` : this.name
    },
    columnsCount() {
      return this.columns ? this.columns : '1'
    },
    columnWidth() {
      return this.columns ? '1/' + this.columns : '1/1'
    },
    draggableOptions(){
      return { 
        group:'kirby-builder', 
        clone: true,
        handle: '.kBuilder__dragDropHandle', 
        forceFallback: true,
        fallbackClass: "sortable-fallback",
        fallbackOnBody: true,
        scroll: document.querySelector(".k-panel-view"),
      }
    },
    blockCount() {
      return this.blocks.length
    },
    fieldsetCount() {
      return Object.keys(this.fieldsets).length
    },
    fieldsetKeys() {
      return Object.keys(this.fieldsets)
    },
    addBlockButtonLabel() {
      return this.$t('add')
    },
    supportedBlockTypes() {
      return Object.keys(this.fieldsets)
    }
  },
  methods: {
    onBlockInput(event) {
      this.$emit("input", this.val);
    },
    onBlockMoved(event) {
      this.$emit("input", this.val);
    },
    onBlockAdded(event) {
      this.$emit("input", this.val);
    },
    onBlockRemoved(event) {
      this.$emit("input", this.val);
    },
    onDragEnd(event) {
      this.drag = false
    },
    onMove(event) {
      this.$root.$emit('blockMoved')
      const isNotLastIndex = event.relatedContext.index != this.blocks.length + 1
      const isNotSameIndex = event.draggedContext.futureIndex == event.draggedContext.index
      const isEmptyList = (this.blocks.length == 0)
      const isSupportedBlockType = this.supportedBlockTypes.includes(event.relatedContext.element.blockKey)
      return (isEmptyList || isNotLastIndex || isNotSameIndex) && isSupportedBlockType
    },
    onStartDrag(event) {
      const draggedBlockPreviewFrame = event.item.getElementsByClassName('kBuilderPreview__frame')[0]
      if (draggedBlockPreviewFrame) {
        window.requestAnimationFrame(() => {
          const originalBlockPreviewFrameDocument = draggedBlockPreviewFrame.contentWindow.document
          const clonedBlockPreviewFrameDocument = document.getElementsByClassName('sortable-drag')[0]
                                      .getElementsByClassName('kBuilderPreview__frame')[0]
                                      .contentWindow
                                      .document
          clonedBlockPreviewFrameDocument.open();
          clonedBlockPreviewFrameDocument.write(originalBlockPreviewFrameDocument.documentElement.innerHTML);
          clonedBlockPreviewFrameDocument.close();
        });
      }
    },
    onClickAddBlock(position) {
      this.targetPosition = position
      if (this.fieldsetCount == 1) {
        this.addBlock(this.fieldsetKeys[0])
      } else {
        this.$refs.dialog.open()
      }
    },
    onOpenDialog() {
      this.dialogOpen = true
    },
    onCloseDialog() {
      this.dialogOpen = false
    },
    addBlock(key) {
      let position = this.targetPosition == null ? this.blocks.length : this.targetPosition
      let fieldSet = this.fieldsets[key]
      let newBlock = this.newBlock(fieldSet, key, this.getBlankContent(key, fieldSet), this.lastUniqueKey++)
      newBlock.isNew = true
      this.blocks.splice(position, 0, JSON.parse(JSON.stringify(newBlock)))
      this.targetPosition = null
      this.$emit("input", this.val);
      if (this.dialogOpen) {
        this.$refs.dialog.close()
      }
    },
    getBlankContent(key, fieldSet) {
      let content = { '_key': key }
      if (fieldSet.fields) {
        Object.keys(fieldSet.fields).forEach(fieldName => {
          content[fieldName] = fieldSet.fields[fieldName].value || fieldSet.fields[fieldName].default || ''
        })
      } else if (fieldSet.tabs) {
        for (const tabName in fieldSet.tabs) {
          if (fieldSet.tabs.hasOwnProperty(tabName)) {
            const tab = fieldSet.tabs[tabName];
            Object.keys(tab.fields).forEach(fieldName => {
              content[fieldName] = tab.fields[fieldName].value || tab.fields[fieldName].default || ''
            })
          }
        }
      }
      return content
    },
    cloneBlock(index) {
      let clone = JSON.parse(JSON.stringify(this.blocks[index]))
      clone.isNew = true
      this.deepRemoveProperty(clone.content, '_uid')
      this.blocks.splice(index + 1, 0, clone)
      this.blocks[index + 1].uniqueKey = this.lastUniqueKey++
      this.$emit("input", this.val);
    },
    deleteBlock(index) {
      this.clearLocalUiStates(this.blocks[index])
      this.blocks.splice(index, 1);
      this.$emit("input", this.val);
    },
    deepRemoveProperty(obj, property) {
      Object.keys(obj).forEach( (prop) => {
        if (prop === property) {
          delete obj[prop]
        } else if (typeof obj[prop] === 'object') {
          this.deepRemoveProperty(obj[prop], property)
        }
      })
    },
    clearLocalUiStates(obj) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          const element = obj[prop];
          if (prop === '_uid') {    
            localStorage.removeItem(`kBuilder.uiState.${obj[prop]}`)
          } else if (typeof obj[prop] === 'object') {
            this.clearLocalUiStates(obj[prop])
          }
        }
      }
    },
    newBlock(fieldSet, key, content, uniqueKey) {
      return {
        fields: fieldSet.fields ? fieldSet.fields : null,
        tabs: fieldSet.tabs ? fieldSet.tabs : null,
        blockKey: key,
        content: content,
        label: fieldSet.label,
        uniqueKey: uniqueKey,
        preview: fieldSet.preview,
        showPreview: false
      }
    }
  }
}
</script>

<style>
.kBuilder__addButton{
  width: 100%;
  background-color: transparent;
  padding: calc(.625rem * 4) .75rem;
  border: 1px dashed #CCC;
  transition: background-color .3s, border-color .3s;
}
.kBuilder__addButton:hover{
  background-color: #81a2be;
  border-color: transparent;
}
.kBuilder__addBlockButton{
  cursor: pointer;
}
.kBuilder .kBuilder--col-1{
  padding-left: 25px;
}
.kBuilder__dragDropHandle{
  width: 38px;
  height: 38px;
  color: #16171a;
  opacity: .25;
  z-index: 1;
  cursor: -webkit-grab;
  will-change: opacity,color;
  -webkit-transition: opacity .3s;
  transition: opacity .3s;
}
.kBuilder__dragDropHandle--col-1{
  position: absolute;
  left: -38px;
  top: 0;
  display: flex;
  opacity: 0;
}
.kBuilder__blocks:hover .kBuilder__dragDropHandle,
kBuilder__blocks:hover .kBuilder__dragDropHandle--col-1{
  opacity: .25;
}
.kBuilder__block .kBuilder__dragDropHandle:hover,
kBuilder__block:hover .kBuilder__dragDropHandle--col-1{
  opacity: 1;
}
.kBuilder__inlineAddButton{
  cursor: pointer;
  position: absolute;
  opacity: 0;
  transition: opacity .3s;  
}
.kBuilder__inlineAddButton:hover{
  opacity: 1;
}
.kBuilder__inlineAddButton::before{
  content: "";
  border-color: #4271ae;
  border-style: dashed;
  border-width: 0;
  display: block;
}
.kBuilder__inlineAddButton--horizontal{
  height: calc(.625rem * 2);
  width: 100%;
  bottom: 100%;
}
.kBuilder__inlineAddButton--horizontal::before{
  border-bottom-width: 2px;
  padding-top: calc(.625rem - 1px);
}
.kBuilder__inlineAddButton--vertical{
  width: 1.5rem;
  height: 100%;
  right: 100%;
}
.kBuilder__inlineAddButton--vertical.kBuilder__inlineAddButton--after{
  left: 100%;
  right: auto;
  top: 0;
}
.kBuilder__inlineAddButton--vertical::before{
  width: calc(1.5rem / 2 + 1px);
  height: 100%;
  border-right-width: 2px;
}

.blocklist-enter-active, .blocklist-leave-active {
  transition: all .5s;
}
.blocklist-enter, .blocklist-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(-5%);
}

.kBuilder--col-1 .kBuilder__blocks{
  grid-row-gap: calc(.625rem * 2);
}

.kBuilder__column{
  position: relative;
}

.kBuilder__dialog .k-list-item-image,
.kBuilder__dialog .k-dialog-button-submit{
  display: none;
}

.kBuilder__blockContent--hidden{
  display: none;
}

.sortable-ghost .kBuilderPreview__frame{
  pointer-events: none;
}
</style>