import React, {createRef} from 'react';
import JE from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

interface JSONEditorProps {
  initial: any;
  schema?: any;
  onChange: (json: any, isValidJson: boolean) => void;
}

export class JSONEditor extends React.Component<JSONEditorProps> {

  private container = createRef<HTMLDivElement>();
  private editor: JE | null = null;

  componentDidMount() {
    if (this.container.current) {
      this.editor = new JE(
        this.container.current,
        {
          mode: "code",
          schema: this.props.schema,
          onChange: () => {
            try {
              this.props.onChange(this.getJSON(), true);
            } catch (e) {
              this.props.onChange("", false);
            }
          },
        },
        this.props.initial
      );
    }
  }

  render () {
    return (
      <div ref={this.container} />
    );
  }

  getJSON () {
      if (this.editor) {
        return this.editor.get();
      }
  }

}
