import './App.css';
import { AnswersHeadlessProvider } from '@yext/answers-headless-react';
import EventsMap from './components/EventsMap';
import { EventsOverlay } from './components/EventsOverlay';
import { AppContextProvider } from './providers/AppContextProvider';

export const answersSandboxEndpoints = {
  universalSearch: 'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/query?someparam=blah',
  verticalSearch: 'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/vertical/query',
  questionSubmission: 'https://liveapi-sandbox.yext.com/v2/accounts/me/createQuestion',
  status: 'https://answersstatus.pagescdn.com',
  universalAutocomplete: 'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/autocomplete',
  verticalAutocomplete:
    'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/vertical/autocomplete',
  filterSearch: 'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/filtersearch',
};

function App() {
  return (
    <div className="font-primary">
      <AnswersHeadlessProvider
        apiKey="a1a498f3b492b925ab84f69d27fedf9c"
        experienceKey="concerts-finder"
        locale="en"
        verticalKey="events"
        endpoints={answersSandboxEndpoints}
      >
        <AppContextProvider>
          <EventsMap />
          <EventsOverlay />
        </AppContextProvider>
      </AnswersHeadlessProvider>
    </div>
  );
}

export default App;
