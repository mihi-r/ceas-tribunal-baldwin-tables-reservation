import { validateInputFieldData } from './common/uiElements';
import { 
    registerCalendarNextButtonClick,
    registerCalendarPrevButtonClick,
    registerCalendarTimesMouseEvents,
    registerClearCalendarButton,
    registerContinueCalendarButton,
    registerMoreInfoButton,
    registerScrollHint,
    registerTableSelection,
    GetEsocName
} from './mainUI';
GetEsocName();
registerMoreInfoButton();
registerTableSelection();
registerScrollHint();
registerCalendarNextButtonClick();
registerCalendarPrevButtonClick();
registerCalendarTimesMouseEvents();
registerClearCalendarButton();
registerContinueCalendarButton();