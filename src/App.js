import * as React from "react";
import * as ReactDOM from "react-dom";
import { Form, Field } from "@progress/kendo-react-form";
import { Input } from "@progress/kendo-react-inputs";
import { guid } from "@progress/kendo-react-common";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { sampleProducts } from "./DummyData/simple-data";
import PDFV from "./PdfViewer";
const FORM_DATA_INDEX = "formDataIndex";
const DATA_ITEM_KEY = "ProductID";
const requiredValidator = (value) => (value ? "" : "The name is required");
const TextInputWithValidation = (fieldRenderProps) => {
  const { validationMessage, visited, ...others } = fieldRenderProps;
  return (
    <div>
      <Input {...others} />
      {visited && validationMessage && (
        <div role="alert" className="k-form-error k-text-start">
          {validationMessage}
        </div>
      )}
    </div>
  );
};
const FormSubmitContext = React.createContext(() => undefined);
const GridEditContext = React.createContext({});
const GridInlineFormRow = (props) => {
  const { onRowAction, editIndex } = React.useContext(GridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;
  const onSubmit = React.useCallback(
    (e) => {
      onRowAction({
        rowIndex: editIndex,
        operation: "save",
        dataItem: e,
      });
    },
    [onRowAction, editIndex]
  );
  if (isInEdit) {
    return (
      <Form
        key={JSON.stringify(props.dataItem)}
        initialValues={props.dataItem}
        onSubmit={onSubmit}
        render={(formRenderProps) => {
          return (
            <FormSubmitContext.Provider value={formRenderProps.onSubmit}>
              {props.children}
            </FormSubmitContext.Provider>
          );
        }}
      />
    );
  }
  return props.children;
};
const NameCell = (props) => {
  const { editIndex } = React.useContext(GridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;
  return (
    <td>
      {isInEdit ? (
        <Field
          component={TextInputWithValidation}
          name={`${props.field}`}
          validator={requiredValidator}
        />
      ) : (
        props.dataItem[props.field || ""]
      )}
    </td>
  );
};

const UnitePriceCell = (props) => {
  const { editIndex } = React.useContext(GridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;
  return (
    <td>
      {isInEdit ? (
        <Field
          component={TextInputWithValidation}
          name={`${props.field}`}
          validator={requiredValidator}
        />
      ) : (
        props.dataItem[props.field || ""]
      )}
    </td>
  );
};

const CommandCell = (props) => {
  const onSubmit = React.useContext(FormSubmitContext);
  const { onRowAction, setEditIndex, editIndex } =
    React.useContext(GridEditContext);
  const rowIndex = props.dataItem[FORM_DATA_INDEX];
  const isInEdit = rowIndex === editIndex;
  const isNewItem = !props.dataItem[DATA_ITEM_KEY];
  const onRemoveClick = React.useCallback(
    (e) => {
      e.preventDefault();
      onRowAction({
        rowIndex,
        operation: "remove",
      });
    },
    [rowIndex, onRowAction]
  );
  const onSaveClick = React.useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(e);
    },
    [onSubmit]
  );
  const onEditClick = React.useCallback(
    (e) => {
      e.preventDefault();
      setEditIndex(rowIndex);
    },
    [rowIndex, setEditIndex]
  );
  const onCancelClick = React.useCallback(
    (e) => {
      e.preventDefault();
      setEditIndex(undefined);
    },
    [setEditIndex]
  );
  return isInEdit ? (
    <td className="k-command-cell">
      <button
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-grid-save-command"
        onClick={onSaveClick}
      >
        {isNewItem ? "Add" : "Update"}
      </button>
      <button
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-grid-cancel-command"
        onClick={isNewItem ? onRemoveClick : onCancelClick}
      >
        {isNewItem ? "Discard" : "Cancel"}
      </button>
    </td>
  ) : (
    <td className="k-command-cell">
      <button
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-grid-edit-command"
        onClick={onEditClick}
      >
        Edit
      </button>
      <button
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-grid-remove-command"
        onClick={onRemoveClick}
      >
        Remove
      </button>
    </td>
  );
};
const rowRender = (row, props) => {
  return <GridInlineFormRow dataItem={props.dataItem}>{row}</GridInlineFormRow>;
};
export const App = () => {
  // Form data index is used as an alternative to ID for rows after data operations
  const [dataState, setDataState] = React.useState(
    sampleProducts.map((dataItem, idx) => ({
      ...dataItem,
      [FORM_DATA_INDEX]: idx,
    }))
  );
  const [editIndex, setEditIndex] = React.useState(undefined);
  const onRowAction = React.useCallback(
    (options) => {
      const newDataState = [...dataState];
      switch (options.operation) {
        case "remove":
          newDataState.splice(options.rowIndex, 1);
          break;
        case "save":
          let index = dataState.findIndex(
            (product) => product.ProductID === options.dataItem.ProductID
          );
          newDataState[index] = options.dataItem;
          setEditIndex(undefined);
          break;
        case "add":
          newDataState.unshift({
            ProductName: "",
            [FORM_DATA_INDEX]: options.rowIndex,
            [DATA_ITEM_KEY]: guid(),
          });
          setEditIndex(options.rowIndex);
          break;
        default:
      }
      setDataState(newDataState);
    },
    [dataState]
  );
  const onAddClick = React.useCallback(() => {
    onRowAction({
      rowIndex: dataState.length,
      operation: "add",
    });
  }, [onRowAction, dataState]);

  const [myFile, setMyFile] = React.useState("")
  const renderPdf = () => {
    return myFile ? <PDFV data={myFile} /> : ""
  }

  return (
    // <GridEditContext.Provider
    //   value={{
    //     onRowAction,
    //     editIndex,
    //     setEditIndex,
    //   }}
    // >
    //   <Grid data={dataState} dataItemKey={DATA_ITEM_KEY} rowRender={rowRender}>
    //     <GridToolbar>
    //       <button
    //         title="Add new"
    //         className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
    //         onClick={onAddClick}
    //       >
    //         Add new
    //       </button>
    //     </GridToolbar>
    //     <GridColumn title="Name" field="ProductName" cell={NameCell} />
    //     <GridColumn
    //       title="Unite Price"
    //       field="UnitPrice"
    //       cell={UnitePriceCell}
    //     />
    //     <GridColumn title="Command" cell={CommandCell} />
    //   </Grid>
    // </GridEditContext.Provider>
<>
    
      <input type='file' onChange={(e) => {
        let reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        reader.onload = () => {

          setMyFile(reader.result)
        }
      }}>
      </input>

      {/* {JSON.stringify(myFile)}
       */}
      
      {/* { renderPdf()} */}
      
      <PDFV  />
</>
    
    
  );
};
export default App;
