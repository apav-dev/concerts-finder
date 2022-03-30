import './App.css';
import { AnswersHeadlessProvider } from '@yext/answers-headless-react';
import EventsMap from './components/EventsMap';
import { MapProvider } from './components/MapContext';

function App() {
  return (
    <div className="font-primary">
      <AnswersHeadlessProvider
        apiKey="a1a498f3b492b925ab84f69d27fedf9c"
        experienceKey="concerts-finder"
        locale="en"
        verticalKey="events"
        endpoints={{
          universalSearch:
            'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/query?someparam=blah',
          verticalSearch: 'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/vertical/query',
          questionSubmission: 'https://liveapi-sandbox.yext.com/v2/accounts/me/createQuestion',
          status: 'https://answersstatus.pagescdn.com',
          universalAutocomplete:
            'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/autocomplete',
          verticalAutocomplete:
            'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/vertical/autocomplete',
          filterSearch: 'https://liveapi-sandbox.yext.com/v2/accounts/me/answers/filtersearch',
        }}
      >
        <MapProvider>
          <EventsMap />
        </MapProvider>
      </AnswersHeadlessProvider>
    </div>
  );
}

export default App;
