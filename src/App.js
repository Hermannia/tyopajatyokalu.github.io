import React, { Component } from 'react';
import './App.css';

import _ from 'lodash';
import { Container, Row, Col } from 'react-grid-system';

import Event from './components/Event';
import EventColumn from './components/EventColumn';
import Filters from './components/Filters';
import HeroImage from './components/HeroImage';
import EventService from './services/eventService';
import EventFilters from './services/eventFilters';
import Favorites from './services/favorites';
import FavoritesList from './components/FavoritesList';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedLevels: [],
      selectedTags: [],
      filtered: [],
      events: [],
      searchText: '',
      loading: true,
      error: false,
      favorites: [],
      showList: true,
    }

    this.handleLevelsChange = this.handleSelectChange('selectedLevels').bind(this);
    this.handleTagsChange = this.handleSelectChange('selectedTags').bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleToggleFavorite = this.handleToggleFavorite.bind(this);
    this.isFavorite = this.isFavorite.bind(this);
  }

  componentDidMount() {
    EventService.getEvents().then(data => {
      this.setState({
        events: _.sortBy(data, 'name'),
        loading: false,
      });
    }).catch(e => {
      this.setState({
        error: true,
        loading: false,
      });
    });

    this.setState({
      favorites: Favorites.getFavorites()
    });
  }

  handleToggleFavorite(event) {
    const newFavorites = Favorites.toggleFavorite(event);
    this.setState({
      favorites: newFavorites
    })
  }

  isFavorite(event) {
    const { favorites } = this.state;
    return favorites.indexOf(Favorites.getKey(event)) !== -1;
  }


  handleSearchChange(e) {
    this.setState({
      searchText: e.target.value
    });
  }

  handleSelectChange(field) {
    return (selected) => {
      let newValues = this.state[field].slice();

      if (newValues.indexOf(selected) === -1) {
        newValues.push(selected);
      } else {
        newValues = newValues.filter(v => v !== selected);
      }

      this.setState({
        [field]: newValues
      });
    }
  }

  renderEvents(filtered) {
    return filtered.map(event => {
      return <Event event={event} />
    })
  }

  renderEventList() {
    const { selectedLevels, selectedTags, searchText, events, favorites } = this.state
    const skillLevels = EventFilters.getLevels(events);
    const tags = EventFilters.getTags(events);
    const filteredEvents = EventFilters.filter(events, selectedLevels, selectedTags, searchText);

    return (
      <React.Fragment>
        <Row>
          <Col sm={12}>
            <Filters
              title="Valitse kategoria(t): "
              options={tags.sort()}
              selected={this.state.selectedTags}
              onChange={this.handleTagsChange}
            />
          </Col>
          <Col sm={12} md={6}>
            <Filters
              title="Valitse taitotaso(t): "
              options={skillLevels}
              selected={this.state.selectedLevels}
              onChange={this.handleLevelsChange}
            />
          </Col>
          <Col sm={12} md={6}>
            <h4>Vapaa haku: </h4>
            <input
              className="App--searchbox"
              value={this.state.searchText}
              onChange={this.handleSearchChange}
              placeholder="Hae työpajan nimellä, vetäjällä tai kuvauksella"
            />
          </Col>
          <Col sm={12}>
            <h4>Näytetään {filteredEvents.length} tapahtumaa</h4>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={4}>
            <EventColumn
              onToggleFavorite={this.handleToggleFavorite}
              isFavorite={this.isFavorite}
              title="Aamupäivä"
              times={[EventFilters.TIMES.morning]}
              events={filteredEvents}
            />
          </Col>
          <Col sm={12} md={4}>
            <EventColumn
              onToggleFavorite={this.handleToggleFavorite}
              isFavorite={this.isFavorite}
              title="Iltapäivä"
              times={[EventFilters.TIMES.afternoon_short, EventFilters.TIMES.afternoon_long]}
              events={filteredEvents}
            />
          </Col>
          <Col sm={12} md={4}>
            <EventColumn
              onToggleFavorite={this.handleToggleFavorite}
              isFavorite={this.isFavorite}
              title="Puheenvuorot"
              times={[EventFilters.TIMES.afternoon_keynote]}
              events={filteredEvents}
            />
          </Col>
        </Row>
      </React.Fragment>
    )
  }

  renderFavoritesList() {
    const { events, favorites } = this.state
    return (
      <Row>
        <Col sm={12}>
          <FavoritesList favorites={favorites} events={events} onToggleFavorite={this.handleToggleFavorite} />
        </Col>
      </Row>
    )
  }

  renderLoading() {
    return (
      <Row>
        <Col sm={12}>
          <p className="App--loading">Ladataan työpajoja...</p>
        </Col>
      </Row>
    )
  }

  render() {
    const { showList, favorites } = this.state;
    return (
      <div className="App">
        <HeroImage />
        <Container>
          <Row>
            <Col sm={12}>
              <div className="App--description">
                <p className="App--description__title">Tervetuloa Työpajatyökaluun!</p>

                <p className="App--description__text"><p/>
                </p>
                  <p>
                  Selaa työpajoja etukäteen, ilmoittaudu elokuussa. Ohjelma täydentyy vielä heinäkuun aikana.
                  </p>
                  <p>
                  1. Valitse lauantaiksi kaksi työpajaa - yksi aamu- ja yksi iltapäivälle. Iltapäivän työpajat ovat eri pituisia. Mikäli valitset lyhyemmän työpajan (klo. 14:15 - 15:45), voit halutessasi mennä kuuntelemaan vielä klo. 16:00 - 16:45 järjestettävää puheenvuoroa.  
                  </p>
                  <p className="App--description__text"></p>
                  <p>
                  2. Valitse tasosi: tutustu, perehdy tai syvenny.
                  </p>
                  <div className="App--description__levels">
                  <p>
                  <strong>Tutustu (keltainen):</strong><br/> Työpajoissa harjoitellaan uusia taitoja ja tutustutaan uusiin aiheisiin ja näkökulmiin tarvitsematta aiempaa tietoa tai kokemusta. 
                  </p>
                  <p>
                  <strong>Perehdy (oranssi):</strong><br/> Asiaa johtamisesta ja johtajuudesta laajasti eri näkökulmista.
                  </p>
                  <p>
                  <strong>Syvenny (punainen):</strong><br/> Työpajoissa sukelletaan syvemmälle rajattuun aiheeseen. Valitse tämä, jos haluat vähemmästä enemmän. Joissakin työpajoissa omat kokemukset tai aiempi tietämys aiheesta ovat toivottavia keskusteluun osallistumiseksi.
                  </p>
                  <p>
                  3. Valitse johtamisen osa-alueet, joihin haluat keskittyä. Olemme luokitelleet työpajat partion johtamismallin mukaan itsensä johtamistaitoihin (minä), vuorovaikutustaitoihin (ryhmä), organisointitaitoihin (toiminta) ja visiointitaitoihin (päämäärä).
                  </p>
                  <p>
                  Minä
                  </p>
                  <ul>
                    <li>Hyvinvointi ja elämänhallinta</li>
                    <li>Suhde itseen</li>
                    <li>Menestyminen työelämässä</li>
                  </ul>
                  <p>
                  Ryhmä
                  </p>
                  <ul>
                    <li>Ihmisten johtaminen</li>
                    <li>Ihmisten kohtaaminen</li>
                    <li>Vuorovaikutus- ja yhteistyötaidot</li>
                  </ul>
                  <p>
                  Toiminta
                  </p>
                  <ul>
                    <li>Kehittäminen ja muutos</li>
                    <li>Työelämätaidot</li>
                    <li>Toiminnan työkaluja</li>
                  </ul>
                  <p>
                  Päämäärä
                  </p>
                  <ul>
                    <li>Halu toimia</li>
                    <li>Vastuullisuus</li>
                  </ul>
                  <p>
                  Vaeltajat (18 - 21-vuotiaat) huomio! Teille on valittu joukko juuri Vaeltaja-ohjelmaan sopivia työpajoja ja ne löytyvät helposti valitsemalla kategoriaksi: ”Suosittelemme Vaeltajille”. 
                  </p>
                  <p>
                  Työpajoja on tällä hetkellä yli 150, joten selaile rauhassa. Työpajoihin ilmoittaudutaan elokuussa. Ohjeet ilmoittautumisesta lähetetään tapahtumaan ilmoittautuneille sähköpostilla.
                  </p>
                  </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <div className="App--toggle-view">
                <div onClick={() => this.setState({ showList: true })} className={`App--toggle-view__option ${showList ? 'active' : ''}`}>
                  <span className="App--toggle-view__option-text">Selaa työpajoja</span>
                </div>
                <div onClick={() => this.setState({ showList: false })} className={`App--toggle-view__option ${showList ? '' : 'active'}`}>
                  <span className="App--toggle-view__option-text">Omat suosikit ({favorites.length})</span>
                </div>
              </div>
            </Col>
          </Row>
          {this.state.loading ?
            (
              this.renderLoading()
            ) : (
              showList ? this.renderEventList() : this.renderFavoritesList()
            )}
        </Container>
        <div style={{ height: '100px' }} />
      </div>
    );
  }
}

export default App;
