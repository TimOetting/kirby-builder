<template>
  <k-field
    :label="label"
    class="kBuilder"
    :class="classObject"
  >
    <k-draggable
      class="kBuilder__blocks k-grid"
      @update="onBlockMoved"
      @add="onBlockAdded"
      @remove="onBlockRemoved"
      @end="onDragEnd"
      :move="onMove"
      :list="value"
      :options="draggableOptions"
    >
      <k-column
        class="kBuilder__column"
        :width="columnWidth"
        v-for="(blockValue, index) in value"
        :key="blockValue._uid"
      >
        <div
          class="kBuilder__inlineAddButton"
          v-if="!max || blockCount < max"
          :class="{'kBuilder__inlineAddButton--horizontal': (columnsCount == 1), 'kBuilder__inlineAddButton--vertical': (columnsCount > 1)}"
          @click="onClickAddBlock(index)"
        ></div>
        <builder-block
          :page-id="pageId"
          :page-uid="pageUid"
          :encoded-page-id="encodedPageId"
          :endpoints="endpoints"
          :block="blockValue"
          :fieldGroup="fieldsets[blockValue._key]"
          :index="index"
          :columns-count="columnsCount"
          :styles="cssContents[blockValue._key]"
          :script="jsContents[blockValue._key]"
          :parentPath="path"
          :canDuplicate="(!max || blockCount < max)"
          @input="onBlockInput"
          @clone="cloneBlock"
          @delete="deleteBlock"
        />
        <div
          v-if="(columnsCount % index == 0 && columnsCount > 1 && (!max || blockCount < max))"
          class="kBuilder__inlineAddButton kBuilder__inlineAddButton--vertical kBuilder__inlineAddButton--after"
          @click="onClickAddBlock(index + 1)"
        ></div>
      </k-column>
      <k-column
        :width="columnWidth"
        v-if="!max || blockCount < max"
      >
        <k-button
          icon="add"
          @click="onClickAddBlock()"
          class="kBuilder__addButton"
        >{{addBlockButtonLabel}}</k-button>
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
          :class="['kBuilder__addBlockButton', 'kBuilder__addBlockButton--' + key]"
          v-for="(value, key) in fieldsets"
          :key="key"
          :text="value.name || value.label"
          @click="addBlock(key)"
        >
          <template slot="options">
            <k-icon
              type="add"
              class="kBuilder__addBlockButtonIcon"
            />
          </template>
        </k-list-item>
      </k-list>
    </k-dialog>
  </k-field>
</template>

<script>
import BuilderBlock from "./BuilderBlock.vue";
import draggable from "vuedraggable";
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
    value: {
      type: String,
      default: []
    },
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
  components: {
    BuilderBlock
  },
  mounted() {
    for (const [fieldSetKey, cssUrl] of Object.entries(this.cssUrls)) {
      fetch("/" + cssUrl.replace(/^\/+/g, "")) //regex removes leading slashes
        .then(res => {
          return res.text();
        })
        .then(res => {
          this.$set(this.cssContents, fieldSetKey, res);
        });
    }
    for (const [fieldSetKey, jsUrls] of Object.entries(this.jsUrls)) {
      fetch("/" + jsUrls.replace(/^\/+/g, "")) //regex removes leading slashes
        .then(res => {
          return res.text();
        })
        .then(res => {
          this.$set(this.jsContents, fieldSetKey, res);
        });
    }
  },
  data() {
    return {
      dragging: false,
      toggle: true,
      targetPosition: null,
      lastUniqueKey: 0,
      cssContents: {},
      jsContents: {},
      dialogOpen: false
    };
  },
  computed: {
    classObject() {
      let classObject = {};
      classObject["kBuilder--col-" + this.columnsCount] = true;
      classObject["kBuilder--dragging"] = this.dragging;
      return classObject;
    },
    path() {
      return this.parentPath ? `${this.parentPath}+${this.name}` : this.name;
    },
    columnsCount() {
      return this.columns ? this.columns : "1";
    },
    columnWidth() {
      return this.columns ? "1/" + this.columns : "1/1";
    },
    draggableOptions() {
      return {
        group: this._uid,
        // clone: true,
        handle: ".kBuilder__dragDropHandle",
        forceFallback: true,
        fallbackClass: "sortable-fallback",
        fallbackOnBody: true,
        scroll: document.querySelector(".k-panel-view")
      };
    },
    blockCount() {
      return this.value.length;
    },
    fieldsetCount() {
      return Object.keys(this.fieldsets).length;
    },
    fieldsetKeys() {
      return Object.keys(this.fieldsets);
    },
    addBlockButtonLabel() {
      return this.$t("add");
    },
    supportedBlockTypes() {
      return Object.keys(this.fieldsets);
    }
  },
  methods: {
    onBlockInput(event) {
      this.$emit("input", this.value);
    },
    onBlockMoved(event) {
      this.$emit("input", this.value);
    },
    onBlockAdded(event) {
      this.$emit("input", this.value);
    },
    onBlockRemoved(event) {
      this.$emit("input", this.value);
    },
    onDragEnd(event) {
      this.dragging = false;
    },
    onMove(event) {
      this.$root.$emit("blockMoved");
      return event.relatedContext.index != this.value.length + 1;
    },
    onStartDrag(event) {
      this.dragging = true;
      const draggedBlockPreviewFrame = event.item.getElementsByClassName(
        "kBuilderPreview__frame"
      )[0];
      if (draggedBlockPreviewFrame) {
        const originalBlockPreviewFrameDocument =
          draggedBlockPreviewFrame.contentWindow.document;
        const clonedBlockPreviewFrameDocument = document
          .getElementsByClassName("sortable-drag")[0]
          .getElementsByClassName("kBuilderPreview__frame")[0].contentWindow
          .document;
        clonedBlockPreviewFrameDocument.open();
        clonedBlockPreviewFrameDocument.write(
          originalBlockPreviewFrameDocument.documentElement.innerHTML
        );
        clonedBlockPreviewFrameDocument.close();
      }
    },
    onClickAddBlock(position) {
      this.targetPosition = position;
      if (this.fieldsetCount == 1) {
        this.addBlock(this.fieldsetKeys[0]);
      } else {
        this.$refs.dialog.open();
      }
    },
    onOpenDialog() {
      this.dialogOpen = true;
    },
    onCloseDialog() {
      this.dialogOpen = false;
    },
    addBlock(key) {
      const position =
        this.targetPosition == null ? this.value.length : this.targetPosition;
      const fieldSet = this.fieldsets[key];
      this.value.splice(position, 0, this.getBlankContent(key, fieldSet));
      this.value[position].isNew = true;
      this.$emit("input", this.value);
      this.$nextTick(function() {
        this.$emit("input", this.value);
      });
      this.targetPosition = null;
      if (this.dialogOpen) {
        this.$refs.dialog.close();
      }
    },
    cloneBlock(index, showPreview, expanded, activeFieldSet) {
      let clone = JSON.parse(JSON.stringify(this.value[index]));
      this.deepRemoveProperty(clone, "_uid");
      this.value.splice(index + 1, 0, clone);
      let cloneValue = this.value[index + 1];
      cloneValue.uniqueKey = this.lastUniqueKey++;
      if (showPreview != null) {
        cloneValue.showPreviewInitially = showPreview;
      }
      if (expanded != null) {
        cloneValue.expandedInitially = expanded;
      }
      if (activeFieldSet) {
        cloneValue.activeFieldSetInitially = activeFieldSet;
      }
      cloneValue.isNew = true;
      this.$emit("input", this.value);
      this.$nextTick(function() {
        this.$emit("input", this.value);
      });
    },
    getBlankContent(key, fieldSet) {
      let content = { _key: key };
      if (fieldSet.fields) {
        Object.keys(fieldSet.fields).forEach(fieldName => {
          content[fieldName] =
            fieldSet.fields[fieldName].value ||
            fieldSet.fields[fieldName].default ||
            null;
        });
      } else if (fieldSet.tabs) {
        for (const tabName in fieldSet.tabs) {
          if (fieldSet.tabs.hasOwnProperty(tabName)) {
            const tab = fieldSet.tabs[tabName];
            Object.keys(tab.fields).forEach(fieldName => {
              content[fieldName] =
                tab.fields[fieldName].value ||
                tab.fields[fieldName].default ||
                null;
            });
          }
        }
      }
      return content;
    },
    deleteBlock(index) {
      this.clearLocalUiStates(this.value[index]);
      this.value.splice(index, 1);
      this.$emit("input", this.value);
    },
    deepRemoveProperty(obj, property) {
      Object.keys(obj).forEach(prop => {
        if (prop === property) {
          delete obj[prop];
        } else if (obj[prop] && typeof obj[prop] === "object") {
          this.deepRemoveProperty(obj[prop], property);
        }
      });
    },
    clearLocalUiStates(obj) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          const element = obj[prop];
          if (prop === "_uid") {
            localStorage.removeItem(`kBuilder.uiState.${obj[prop]}`);
          } else if (typeof obj[prop] === "object") {
            this.clearLocalUiStates(obj[prop]);
          }
        }
      }
    }
  }
};
</script>

<style>
/* Allow line breaks in validation error message */
.k-error-details li {
  white-space: pre-line; 
  word-wrap: break-word;
  font-family: inherit;
  margin-top: -1.25em;
}

.kBuilder__addButton {
  width: 100%;
  background-color: transparent;
  padding: calc(0.625rem * 4) 0.75rem;
  border: 1px dashed #ccc;
  transition: background-color 0.3s, border-color 0.3s;
}
.kBuilder__addButton:hover {
  background-color: #81a2be;
  border-color: transparent;
}
.kBuilder__addBlockButton {
  cursor: pointer;
}
.kBuilder__addBlockButtonIcon {
  margin-right: .75em;
}
.kBuilder .kBuilder--col-1 {
  padding-left: 25px;
}
.kBuilder__dragDropHandle {
  width: 38px;
  height: 38px;
  color: #16171a;
  opacity: 0.25;
  z-index: 1;
  cursor: -webkit-grab;
  will-change: opacity, color;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
}
.kBuilder__dragDropHandle--col-1 {
  position: absolute;
  left: -38px;
  top: 0;
  display: flex;
  opacity: 0;
}
.kBuilder__blocks:hover .kBuilder__dragDropHandle,
kBuilder__blocks:hover .kBuilder__dragDropHandle--col-1 {
  opacity: 0.25;
}
.kBuilder__block .kBuilder__dragDropHandle:hover,
kBuilder__block:hover .kBuilder__dragDropHandle--col-1 {
  opacity: 1;
}
.kBuilder__inlineAddButton {
  cursor: pointer;
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s;
}
.kBuilder__inlineAddButton:hover {
  opacity: 1;
}
.kBuilder__inlineAddButton::before {
  content: "";
  border-color: #4271ae;
  border-style: dashed;
  border-width: 0;
  display: block;
}
.kBuilder__inlineAddButton--horizontal {
  height: calc(0.625rem * 2);
  width: 100%;
  bottom: 100%;
}
.kBuilder__inlineAddButton--horizontal::before {
  border-bottom-width: 2px;
  padding-top: calc(0.625rem - 1px);
}
.kBuilder__inlineAddButton--vertical {
  width: 1.5rem;
  height: 100%;
  right: 100%;
}
.kBuilder__inlineAddButton--vertical.kBuilder__inlineAddButton--after {
  left: 100%;
  right: auto;
  top: 0;
}
.kBuilder__inlineAddButton--vertical::before {
  width: calc(1.5rem / 2 + 1px);
  height: 100%;
  border-right-width: 2px;
}

.blocklist-enter-active,
.blocklist-leave-active {
  transition: all 0.5s;
}
.blocklist-enter, .blocklist-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(-5%);
}

.kBuilder--col-1 .kBuilder__blocks {
  grid-row-gap: calc(0.625rem * 2);
}

.kBuilder__column {
  position: relative;
}

.kBuilder__dialog .k-list-item-image,
.kBuilder__dialog .k-dialog-button-submit {
  display: none;
}

.kBuilder__blockContent--hidden {
  display: none;
}

.kBuilder--dragging .kBuilderPreview__frame {
  pointer-events: none;
}
</style>