import { useToastContext } from "@components/ui/ToastContext";
import { chooseExercisesSelectors } from "@store/chooseExercises/chooseExercises.logic";
import { searchExercisesSelectors } from "@store/searchExercises/searchExercises.logic";
import { Button } from "primereact/button";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import { JSX, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { ChooseExercises } from "./components/ChooseExercises/ChooseExercises";
import { CreateExercise } from "./components/CreateExercise/CreateExercise";
import { SearchExercises } from "./components/SearchExercises/SearchExercises";

type AddExerciseViewMode = "choose" | "search" | "create";

export const AssignmentViewComponent = ({
  mode,
  onExerciseAdd
}: {
  mode: AddExerciseViewMode;
  onExerciseAdd: VoidFunction;
}) => {
  const config: Record<AddExerciseViewMode, JSX.Element> = {
    choose: <ChooseExercises />,
    search: <SearchExercises />,
    create: <CreateExercise onExerciseAdd={onExerciseAdd} />
  };

  return config[mode];
};

export const AddExerciseModal = () => {
  const dialogRef = useRef<Dialog>(null);
  const [showDialog, setShowDialog] = useState(false);
  const modes: MenuItem[] = [
    { label: "Choose exercises from the book", id: "choose" },
    { label: "Search exercises", id: "search" },
    { label: "Write an exercise", id: "create" }
  ];
  const [mode, setMode] = useState(0);
  const { showToast, clearToast } = useToastContext();
  const exercisesToAdd = useSelector(chooseExercisesSelectors.getExercisesToAdd);
  const exercisesToRemove = useSelector(chooseExercisesSelectors.getExercisesToRemove);
  const selectedExercisesFromSearch = useSelector(searchExercisesSelectors.getSelectedExercises);

  const hasAnyChanges =
    !!exercisesToAdd.length || !!exercisesToRemove.length || !!selectedExercisesFromSearch.length;

  const onCloseButtonClick = () => {
    const toAddLength = exercisesToAdd.length + selectedExercisesFromSearch.length;
    const addText = toAddLength ? `${toAddLength} exercises to add` : "";
    const removeText = exercisesToRemove.length
      ? `${exercisesToRemove.length} exercises to remove`
      : "";
    const conjunction = addText && removeText ? " and " : "";

    const popupText = `You have selected ${addText}${conjunction}${removeText}.
Closing this modal will not add or remove any exercises. Close the dialog?`;

    if (hasAnyChanges) {
      confirmPopup({
        style: {
          width: "30vw"
        },
        target: dialogRef?.current?.getCloseButton(),
        message: popupText,
        icon: "pi pi-exclamation-triangle",
        defaultFocus: "accept",
        accept: () => setShowDialog(false)
      });
    } else {
      setShowDialog(false);
    }
  };

  const handleClose = () => setShowDialog(false);

  const handleOpen = () => {
    clearToast();
    setShowDialog(true);
  };

  const onExerciseAdd = () => {
    handleClose();
    showToast({
      severity: "success",
      sticky: true,
      content: () => (
        <div className="flex flex-column align-items-left" style={{ flex: "1" }}>
          <div className="flex align-items-center gap-2">
            <span className="text-900">Exercise has been created!</span>
          </div>
          <div className="font-medium my-3 text-900">Would you like to add a new one?</div>
          <Button
            className="p-button-sm flex"
            label="Add New Exercise"
            severity="info"
            onClick={() => {
              handleOpen();
              clearToast();
            }}
          ></Button>
        </div>
      )
    });
  };

  return (
    <div>
      <Button type="button" label="Add Exercise" onClick={handleOpen} size="small" />
      <ConfirmPopup />
      <Dialog
        ref={dialogRef}
        header={<TabMenu model={modes} activeIndex={mode} onTabChange={(e) => setMode(e.index)} />}
        visible={showDialog}
        style={{ width: "90vw" }}
        headerStyle={{ padding: "1rem 2rem" }}
        modal
        maximizable
        onHide={onCloseButtonClick}
      >
        <AssignmentViewComponent
          onExerciseAdd={onExerciseAdd}
          mode={modes[mode].id as AddExerciseViewMode}
        />
      </Dialog>
    </div>
  );
};
