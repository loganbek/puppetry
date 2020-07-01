import React from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import ErrorBoundary from "component/ErrorBoundary";
import { remote } from "electron";
import { confirmUnsavedChanges  } from "service/smalltalk";
import classNames from "classnames";
import { FileList } from "./ProjectExplorer/FileList";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "action";
import { confirmDeleteSnippets } from "service/smalltalk";

const { Menu, MenuItem } = remote,

      // Mapping state to the props
      mapStateToProps = ( state ) => ({
        snippets: Object.values( state.snippets.groups.snippets.tests ?? {}),
        active: state.project.lastOpenSnippetId
      }),
      // Mapping actions to the props
      mapDispatchToProps = ( dispatch ) => ({
        action: bindActionCreators( actions, dispatch )
      });

@connect( mapStateToProps, mapDispatchToProps )
export class SnippetExplorer extends React.Component {

  static propTypes = {
    action:  PropTypes.shape({
      setProject: PropTypes.func.isRequired,
      addAppTab: PropTypes.func.isRequired,
      addSnippetsTest: PropTypes.func.isRequired,
      addSnippetsTest: PropTypes.func.isRequired,
      removeSnippetsTest: PropTypes.func.isRequired
    }),

    files: PropTypes.arrayOf( PropTypes.string ).isRequired,
    projectDirectory: PropTypes.string.isRequired,
    projects: PropTypes.object.isRequired,

    active: PropTypes.string,
    suiteModified: PropTypes.bool
  }

  state = {
    clicked: ""
  }

  onClick = ( e ) => {
    e.preventDefault();
    this.setState({ clicked: e.target.dataset.id });
  }

  onDblClick = async ( e ) => {
    e.preventDefault();
    await this.openSnippet( e.target.dataset.id );
  }

  async openSnippet( lastOpenSnippetId ) {
    this.props.action.setProject({ lastOpenSnippetId });
    this.props.action.addAppTab( "snippet" );
  }

  onRightClick = ( e ) => {
    const id = e.target.dataset.id,
          title = e.target.dataset.title,
          { projectDirectory } = this.props,
          { addSnippetsTest } = this.props.action;

    e.preventDefault();

    this.setState({ clicked: id });

    const menu = new Menu();

    menu.on( "menu-will-close", () => {
      this.setState({ clicked: "" });
    });


    menu.append( new MenuItem({
      label: "Open",
      click: async () => {
        await this.openSnippet( id );
      }
    }) );

    menu.append( new MenuItem({
      label: "Rename...",
      click: async () => {
        this.props.action.setApp({
          editSnippetModal: true,
          snippetModal: { title, id }
        });
      }
    }) );

    menu.append( new MenuItem({
      label: "Save as...",
      click: async () => {
        this.props.action.setApp({
          saveSnippetAsModal: true,
          snippetModal: { title, id }
        });
      }
    }) );

    menu.append( new MenuItem({
      label: "Delete",
      click: async () => {
        const sure = await confirmDeleteSnippets( id );
        if ( sure ) {
          this.props.action.removeSnippetsTest({ id });
          this.props.action.autosaveSnippets();
        }
      }
    }) );

    menu.popup({
      x: e.x,
      y: e.y
    });
  }


  onNewSnippet = async () => {
    this.props.action.setApp({ newSnippetModal: true });
  }


  render() {
    const { projectDirectory, snippets, active } = this.props;
    window.consoleCount( __filename );
    return (
      <ErrorBoundary>
        <div id="cSnippetNavigator" className="project-navigator project-navigator--snippet">
          <h2>Snippets

            <a
              tabIndex={1} role="button"
              title="Create a snippet"
              className="project-navigator__add" onClick={ this.onNewSnippet }>
              <Icon type="plus-square" /></a>


          </h2>
          { projectDirectory ? <nav className="project-navigator__nav">
            { snippets.map( ( entity, inx ) => (

              <div
                key={ `d${inx}` }
              >

                <ul>

                  <li key={ `f${inx}` }
                    onClick={ this.onClick }
                    onDoubleClick={ this.onDblClick }
                    onContextMenu={ this.onRightClick }
                    data-id={ entity.id }
                    data-title={ entity.title }
                    className={ classNames({
                      "project-navigator__li": true,
                      "is-active": active === entity.id,
                      "is-clicked": this.state.clicked ===  entity.id
                    }) }>
                    <Icon type="file" /> { entity.title }
                  </li>


                </ul>

              </div>

            ) ) }
          </nav> :  null }

        </div>
      </ErrorBoundary>
    );
  }
}
