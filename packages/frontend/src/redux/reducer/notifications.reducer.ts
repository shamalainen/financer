import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ToastMessage } from '$blocks/toast/toast';

interface NotificationState {
  toastMessages: ToastMessage[];
}

const initialState: NotificationState = {
  toastMessages: [],
};

export const notificationSlicePath = 'notification';

type SetToastMessageArgs = Omit<ToastMessage, 'id'> &
  Partial<Pick<ToastMessage, 'id'>>;

const notificationsSlice = createSlice({
  name: notificationSlicePath,
  initialState,
  reducers: {
    addToastMessage(
      state,
      { payload }: PayloadAction<SetToastMessageArgs | SetToastMessageArgs[]>,
    ) {
      const newToastMessages = (
        Array.isArray(payload) ? payload : [payload]
      ).map((toast) => ({
        id: crypto.randomUUID(),
        ...toast,
      }));

      const updatedToastMessages = [...state.toastMessages]
        .filter(
          (tm) => newToastMessages.findIndex(({ id }) => tm.id === id) === -1,
        )
        .concat(newToastMessages);

      return { ...state, toastMessages: updatedToastMessages };
    },
    removeToastMessage(state, { payload }: PayloadAction<ToastMessage['id']>) {
      return {
        ...state,
        toastMessages: state.toastMessages.filter(({ id }) => id !== payload),
      };
    },
  },
});

export const { addToastMessage, removeToastMessage } =
  notificationsSlice.actions;
export const { reducer: notificationReducer } = notificationsSlice;
