import { justify } from "service/assert";
import { INPUT } from "../../constants";
import ExpressionParser from "service/ExpressionParser";
import { truncate } from "service/utils";

export const type = {
  template: ({ target, params, id }) => {
    const parser = new ExpressionParser( id );
    return justify(
      `// Emulating user input\n`
    + `await ( await ${target}() ).type( ${ parser.stringify( params.value ) } );` );
  },

  toLabel: ({ params }) => `(\`${ truncate( params.value, 80 ) }\`)`,
  toText: ({ params }) => `(\`${ params.value }\`)`,
  commonly: "",

  description: `Focuses the element, and then sends keyboard events for each character in the text`,
  params: [
    {

      legend: "",
      tooltip: "",
      fields: [
        {
          name: "params.value",
          template: true,
          control: INPUT,
          label: "A text to type",
          help: "",
          placeholder: "e.g. Jon Snow",
          initialValue: "",
          rules: [{
            required: true,
            message: "Text required"
          }]
        }
      ]
    }
  ]
};
