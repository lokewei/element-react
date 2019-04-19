import React from 'react';
import ScrollToTop from 'react-scroll-up';
import classnames from 'classnames';

import { i18n } from '../src';

import en from '../src/locale/lang/en';
import zh from '../src/locale/lang/zh-CN';

import locales from './locales';
import pages from './pages';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    const theme = window.localStorage.getItem('element-react-fancy-theme') || 'blue';
    this.changePageTheme(theme);
    this.state = {
      theme
    };
  }

  changePageTheme(theme) {
    const themeTag = document.getElementById('theme-tag');
    themeTag && themeTag.remove();
    if (theme === 'dark') {
      themeTag.href = 'element-theme-fancy/lib/index.css';
      document.documentElement.style.setProperty('--source-background-color', '#404040');
      // import(
      //   /* webpackChunkName: "theme-default" */
      //   'element-theme-fancy'
      // );
    }
    if (theme === 'blue') {
      themeTag.href = 'element-theme-default/lib/index.css';
      document.documentElement.style.setProperty('--source-background-color', 'none');
      // import(
      //   /* webpackChunkName: "theme-fancy" */
      //   'element-theme-default'
      // );
    }
  }

  componentWillMount() {
    window.addEventListener("hashchange", () => {
      window.scrollTo(0, 0);

      this.setPage();
    }, false);
  }

  componentDidMount() {
    this.setPage(() => {
      if (!this.state.locale) {
        this.setLocale(localStorage.getItem('ELEMENT_LANGUAGE') || 'zh-CN');
      }
    });
  }

  componentDidUpdate(props, state) {
    if (state.locale != this.state.locale) {
      switch(this.state.locale) {
        case 'en-US':
          i18n.use(en); break;
        default:
          i18n.use(zh); break;
      }
    }
  }

  getLocale(key) {
    const map = locales[this.state.locale] || {};

    return key.split('.').reduce((a, b) => {
      const parent = map[a];

      if (b) {
        return (parent || {})[b];
      }

      return parent;
    });
  }

  setLocale(locale) {
    window.location.hash = `/${locale}/${this.state.page}`;
  }

  getPage() {
    const routes = location.hash.match(/(?:\/(.+))?\/(.+)/);

    if (routes) {
      if (locales.hasOwnProperty(routes[1])) {
        this.setState({ locale: routes[1] }, () => {
          localStorage.setItem('ELEMENT_LANGUAGE', this.state.locale);
        });
      }

      return routes[2];
    }

    return 'quick-start';
  }

  setPage(fn) {
    this.setState({ page: this.getPage() }, fn);
  }

  getComponent(page) {
    this.components = this.components || Object.assign(Object.values(pages.components).reduce((a, b) => {
      return Object.assign(a, b);
    }, {}), pages.documents);

    const result = this.components[page];

    if (result) {
      return React.createElement(result.default, {
        locale: {
          show: this.getLocale('markdown.show'),
          hide: this.getLocale('markdown.hide')
        }
      });
    }
  }

  switchTheme(theme) {
    window.localStorage.setItem('element-react-fancy-theme', theme);
    window.location.reload();
    this.setState({
      theme
    });
  }

  render() {
    const { theme } = this.state;
    return (
      <div className="app">
        <header className="header">
          <div className="container">
            <h1>
              <img src={require('./assets/logo.svg')} />
            </h1>
            <ul className="nav">
              <li className="nav-item">
                <a href={`http://element.eleme.io/#/${this.state.locale}/guide/design`} target="_blank" rel="noopener noreferrer">{this.getLocale('misc.guide')}</a>
              </li>
              <li className="nav-item">
                <a className="active">{this.getLocale('misc.component')}</a>
              </li>
              <li className="nav-item">
                <a href={`http://element.eleme.io/#/${this.state.locale}/resource`} target="_blank" rel="noopener noreferrer">{this.getLocale('misc.resource')}</a>
              </li>
              <li className="nav-item">
                <span className={classnames('nav-lang', { active: this.state.locale === 'zh-CN'})} onClick={this.setLocale.bind(this, 'zh-CN')}>中文</span>
                <span> / </span>
                <span className={classnames('nav-lang', { active: this.state.locale === 'en-US'})} onClick={this.setLocale.bind(this, 'en-US')}>En</span>
              </li>
            </ul>
            <ul className="themes">
              <li title="blue" className={theme === 'blue' || !theme ? 'active' : ''} style={{ backgroundColor: '#20a0ff' }} onClick={() => this.switchTheme('blue')}></li>
              <li title="dark" className={theme === 'dark' ? 'active' : ''} style={{ backgroundColor: '#2b2b2b' }} onClick={() => this.switchTheme('dark')}></li>
            </ul>
          </div>
        </header>
        <div className="main container">
          <nav className="side-nav">
            <ul>
              <li className="nav-item">
                <a>{this.getLocale('misc.development')}</a>
                <ul className="pure-menu-list sub-nav">
                  {
                    Object.keys(pages.documents).map(page => {
                      return (
                        <li className="nav-item" key={page}>
                          <a href={`#/${this.state.locale}/${page}`} className={page === this.state.page ? 'active' : ''}>{this.getLocale(`page.${page}`)}</a>
                        </li>
                      )
                    })
                  }
                </ul>
              </li>
              <li className="nav-item">
                <a>{this.getLocale('misc.components')}</a>
                {
                  Object.keys(pages.components).map(group => {
                    return (
                      <div className="nav-group" key={group}>
                        <div className="nav-group__title">{group}</div>
                        <ul className="pure-menu-list">
                          {
                            Object.keys(pages.components[group]).map(page => {
                              return (
                                <li key={page} className="nav-item">
                                  <a href={`#/${this.state.locale}/${page}`} className={page === this.state.page ? 'active' : ''}>{this.getLocale(`page.${page}`)}</a>
                                </li>
                              )
                            })
                          }
                        </ul>
                      </div>
                    )
                  })
                }
              </li>
            </ul>
          </nav>
          <div className="content">
            { this.getComponent(this.state.page) }
            <ScrollToTop showUnder={210}>
              <div className="page-component-up">
                <i className="el-icon-caret-top"></i>
              </div>
            </ScrollToTop>
          </div>
        </div>
        <footer className="footer">
          <div className="container">
            <div className="footer-main">
              <p className="footer-main-title">Element-React</p>
              <a href="https://github.com/eleme/element-react/issues" target="_blank" rel="noopener noreferrer" className="footer-main-link">{this.getLocale('misc.feedback')}</a>
              <a href="https://github.com/eleme/element-react/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="footer-main-link">{this.getLocale('misc.contribution')}</a>
              <a href={`http://element.eleme.io/#/${this.state.locale}/component/${this.state.page}`} target="_blank" rel="noopener noreferrer" className="footer-main-link">Element</a>
            </div>
            <div className="footer-social">
              <a href="//github.com/eleme/element-react" target="_blank" rel="noopener noreferrer">
                <img src={require('./assets/github.png')} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    )
  }
}
