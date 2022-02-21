import Vue from "vue";

const VueLabel = Vue.extend({
  props: {
    classes: String,
    label: String,
  },
  template: `
    <p :class="classes">{{ label }}</p>
  `,
});

const VueContainer = Vue.extend({
  template: `
    <div class="sliders-and-fields"/>
  `,
});

const VueSelect = Vue.extend({
  methods: {
    emitSelectionChanged: function(value) {
      this.$emit("selectionChanged", this.index, value);
    }
  },
  props: {
    index: Number,
    parent: Object,
    possibleValues: Array,
    vModel: Number,
  },
  template: `
    <el-select class="discrete" popper-class="discrete-popper" size="mini" v-model="vModel" :popper-append-to-body="false" @change="emitSelectionChanged">
      <el-option v-for="possibleValue in possibleValues" :key="possibleValue.value" :label="possibleValue.name" :value="possibleValue.value" />
    </el-select>
  `,
});

const VueSlider = Vue.extend({
  methods: {
    emitSynchroniseSliderAndInputNumber: function(value) {
      this.$emit("synchroniseSliderAndInputNumber", this.index, value);
    }
  },
  props: {
    disabled: Boolean,
    index: Number,
    maximumValue: Number,
    parent: Object,
    vModel: Number,
  },
  template: `
    <el-slider v-model="vModel" :disabled="disabled" :max="maximumValue" :show-input="false" :show-tooltip="false" @input="emitSynchroniseSliderAndInputNumber" />
  `,
});

const VueInputNumber = Vue.extend({
  methods: {
    emitSynchroniseSliderAndInputNumber: function(value) {
      this.$emit("synchroniseSliderAndInputNumber", this.index, value);
    }
  },
  props: {
    disabled: Boolean,
    index: Number,
    maximumValue: Number,
    minimumValue: Number,
    parent: Object,
    vModel: Number,
  },
  template: `
    <el-input-number class="scalar" size="mini" v-model="vModel" :controls="false" :disabled="disabled" :max="maximumValue" :min="minimumValue" @change="emitSynchroniseSliderAndInputNumber" />
  `,
});

export default class Ui {
  discreteElements = [{}];
  scalarElements = [{}];

  setVueAttributes(root, element) {
    root.attributes.forEach((attribute) => {
      element.setAttribute(attribute.nodeName, attribute.nodeValue);
    });

    element.children.forEach((childElement) => {
      this.setVueAttributes(root, childElement);
    });
  }

  addVueElement(root, parent, element) {
    element.$mount();

    this.setVueAttributes(root, element.$el);

    parent.appendChild(element.$el);
  }

  selectionChanged() {
    // Enable/disable all the scalar elements.

    let ui = (this instanceof Ui)?this:this.parent;

    ui.scalarElements.forEach((scalarElement) => {
      let enabled = scalarElement.enabled;

      if (enabled !== undefined) {
        ui.discreteElements.forEach((discreteElement) => {
          if (discreteElement.id !== undefined) {
            let re = new RegExp(`\\b${ discreteElement.id }\\b`, 'g');

            enabled = enabled.replace(re, discreteElement.select.vModel);
          }
        });

        let disabled = !eval(enabled);

        scalarElement.slider.disabled = disabled;
        scalarElement.input_number.disabled = disabled;
      }
    });
  }

  synchroniseSliderAndInputNumber(index, value) {
    // Make sure that both a slider and its corresponding input number have
    // the same value.

    this.parent.scalarElements[index].slider.vModel = value;
    this.parent.scalarElements[index].input_number.vModel = value;
  }

  constructor(root, json) {
    // Generate the UI for the input fields.

    let inputRoot = root.input;
    let isPreviousDiscrete = true;
    let slidersAndFieldsContainer = undefined;
    let firstScalarInput = true;
    let discreteElementIndex = -1;
    let scalarElementIndex = -1;

    json.input.forEach((input) => {
      // Determine whether we are dealing with a discrete or a scalar input.

      let isDiscrete = input.possibleValues !== undefined;

      // Determine our element mode and create a container for our sliders and
      // input numbers, if needed.

      if (!isDiscrete && isPreviousDiscrete) {
        slidersAndFieldsContainer = new VueContainer();

        this.addVueElement(inputRoot, inputRoot, slidersAndFieldsContainer);
      }

      isPreviousDiscrete = isDiscrete;

      // Add the Label.

      let label = new VueLabel({
        propsData: {
          classes: "default " + (isDiscrete?"discrete":firstScalarInput?"first-scalar":"scalar"),
          label: input.name,
        }
      });

      this.addVueElement(inputRoot, isDiscrete?inputRoot:slidersAndFieldsContainer.$el, label);

      firstScalarInput = isDiscrete;

      // Add a drop-down list or a slider and a text box depending on whether
      // we are dealing with a discrete or a scalar input.

      if (isDiscrete) {
        // Add the drop-down list.

        ++discreteElementIndex;

        let select = new VueSelect({
          propsData: {
            index: discreteElementIndex,
            parent: this,
            possibleValues: input.possibleValues,
            vModel: input.defaultValue,
          },
        });

        this.addVueElement(inputRoot, inputRoot, select);

        select.$on("selectionChanged", this.selectionChanged);

        // Keep track of the select and its id.

        this.discreteElements[discreteElementIndex] = {
          id: input.id,
          select: select,
        };
      } else {
        // Add the slider and input number.

        ++scalarElementIndex;

        let slider = new VueSlider({
          propsData: {
            disabled: false, //---GRY--- TO BE UPDATED!
            index: scalarElementIndex,
            maximumValue: input.maximumValue,
            parent: this,
            vModel: input.defaultValue,
          },
        });
        let inputNumber = new VueInputNumber({
          propsData: {
            disabled: false, //---GRY--- TO BE UPDATED!
            index: scalarElementIndex,
            maximumValue: input.maximumValue,
            minimumValue: input.minimumValue,
            parent: this,
            vModel: input.defaultValue,
          },
        });

        this.addVueElement(inputRoot, slidersAndFieldsContainer.$el, slider);
        this.addVueElement(inputRoot, slidersAndFieldsContainer.$el, inputNumber);

        slider.$on("synchroniseSliderAndInputNumber", this.synchroniseSliderAndInputNumber);
        inputNumber.$on("synchroniseSliderAndInputNumber", this.synchroniseSliderAndInputNumber);

        // Keep track of the slider and input number.

        this.scalarElements[scalarElementIndex] = {
          enabled: input.enabled,
          input_number: inputNumber,
          slider: slider,
        };
      }
    });

    // Initially enable/disable all the scalar elements by pretending that a
    // selection changed.

    this.selectionChanged();
  }
}
