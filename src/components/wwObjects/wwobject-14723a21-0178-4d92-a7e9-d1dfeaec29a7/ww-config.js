export default {
  editor: {
    label: {
      en: "Dropdown",
    },
    icon: "navigator-dropdown",
    navigator: {
      groups: ["Trigger", "Dropdown"],
    },
  },
  properties: {
    triggerType: {
      label: {
        en: "Trigger",
      },
      type: "TextSelect",
      defaultValue: "click",
      options: {
        options: [
          { value: "click", label: { en: "Click" } },
          { value: "hover", label: { en: "Hover" } },
          { value: "right-click", label: { en: "Right click" } }
        ],
      },
    },
    position: {
      label: {
        en: "Position",
      },
      type: "TextSelect",
      defaultValue: "bottom",
      options: {
        options: [
          { value: "top", label: { en: "Top" } },
          { value: "right", label: { en: "Right" } },
          { value: "bottom", label: { en: "Bottom" } },
          { value: "left", label: { en: "Left" } },
        ],
      },
    },
    alignment: {
      label: { en: "Align" },
      type: "TextRadioGroup",
      options: (content) => {
        if (content.position === "top" || content.position === "bottom") {
          return {
            choices: [
              {
                value: "start",
                title: { en: "Start" },
                icon: "align-left",
              },
              {
                value: "center",
                title: { en: "Center" },
                icon: "align-center",
              },
              { value: "end", title: { en: "End" }, icon: "align-right" },
            ],
          };
        } else {
          return {
            choices: [
              {
                value: "start",
                title: { en: "Start" },
                icon: "align-y-start",
              },
              {
                value: "center",
                title: { en: "Center" },
                icon: "align-y-center",
              },
              { value: "end", title: { en: "End" }, icon: "align-y-end" },
            ],
          };
        }
      },
      defaultValue: "start",
      classes: true,
      states: true,
    },
    offsetX: {
      type: "Length",
      label: {
        en: "Offset (x)",
        fr: "Taille",
      },
      bindable: true,
      options: {
        unitChoices: [
          { value: "px", label: "px", min: 1, max: 1000 },
          { value: "%", label: "%", min: 1, max: 100 },
        ],
        noRange: true,
        useVar: true,
      },
      bindingValidation: {
        type: 'string',
        tooltip: 'A string that defines size of offset in px or %',
      }
    },
    offsetY: {
      type: "Length",
      label: {
        en: "Offset (y)",
        fr: "Taille",
      },
      bindable: true,
      options: {
        unitChoices: [
          { value: "px", label: "px", min: 1, max: 1000 },
          { value: "%", label: "%", min: 1, max: 100 },
        ],
        noRange: true,
        useVar: true,
      },
      bindingValidation: {
        type: 'string',
        tooltip: 'A string that defines size of offset in px or %',
      }
    },
    triggerLayout: {
      hidden: true,
      defaultValue: [],
      navigator: {
        group: "Trigger",
      },
    },
    dropdownLayout: {
      hidden: true,
      defaultValue: [],
      navigator: {
        group: "Dropdown",
      },
    },
    dropdownZIndex: {
      label: 'Dropdown z-index',
      type: 'Number',
      options: {
        min: 0,
        max: 100,
      },
      responsive: true,
      states: true,
      classes: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "A number that defines the Z-index of the dropdown.",
      },
    },
    disabled: {
      type: "OnOff",
      label: {
        en: "Disabled",
      },
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean",
        tooltip: "A boolean that defines the disabled state`",
      },
    },
    animated: {
      type: "OnOff",
      label: {
        en: "Animated",
      },
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean",
        tooltip: "A boolean that defines whether element is animated",
      },
    },
    forceDisplayEditor: {
      type: "OnOff",
      label: {
        en: "Force display in editor",
      }
    },
  },
};
