import React from 'react'
import createReactClass from 'create-react-class'
import T from 'prop-types'
import {groupBy, values, tail, unnest} from 'ramda'

const MENU_WIDTH = 180

const styles = {
  wrap: {
    minHeight: '100%',
  },
  menuBtn: {
    padding: 15,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  menuBtnBar: {
    background: '#000',
    width: 15,
    height: 2,
    borderRadius: 1,
    marginBottom: 3,
  },
  menu({topLevel}) {
    return {
      fontFamily: '"Lucida Grande", Helvetica, arial, sans-serif',
      marginLeft: 6,
      paddingLeft: 4,
    }
  },
  menuWrap({fullWidth, menuOpen}) {
    return {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: fullWidth && !menuOpen ? -MENU_WIDTH : 0,
      width: MENU_WIDTH,
      background: '#f5f5f5',
      borderRight: 'solid 1px #ddd',
      boxSizing: 'border-box',
      padding: '20px 10px',
      overflow: 'auto',
      transition: 'left .25s',
      zIndex: 1000,
    }
  },
  node: {
    padding: '0 0',
  },
  nodeName: {
    margin: '2px 0',
    fontSize: '12px',
    lineHeight: '20px',
    fontWeight: 'bold',
    color: '#000',
  },
  leaf({current}) {
    return {
      display: 'block',
      textDecoration: 'none',
      color: 'black',
      fontSize: '12px',
      lineHeight: '20px',
      margin: '2px 0',
      textDecoration: current ? 'underline' : 'none',
    }
  },
  content({fullWidth}) {
    return {
      marginLeft: fullWidth ? 0 : MENU_WIDTH,
      padding: fullWidth ? '10px 0' : 10,
    }
  }
}



function locationCutHead(item) {
  return {...item, location: tail(item.location)}
}

function isLeaf(item) {
  return item.location.length === 1
}

function isNode(item) {
  return item.location.length > 1
}

function node(children) {
  return {
    type: 'node',
    name: children[0].location[0],
    children: toTree(children.map(locationCutHead)),
  }
}

function leaf(item) {
  return {
    type: 'leaf',
    name: item.location[0],
    hash: item.hash,
  }
}

function groupToTree(group) {
  const children = group.filter(isNode)
  return group.filter(isLeaf).map(leaf).concat(children.length > 0 ? [node(children)] : [])
}

function toTree(arr) {
  return unnest(values(groupBy(item => item.location[0], arr)).map(groupToTree))
}

const MenuNode = props =>
  <div style={styles.node}>
    <div style={styles.nodeName}>{props.name}</div>
    <Menu items={props.children} current={props.current} />
  </div>

const MenuLeaf = props =>
  <a
    href={`#!${props.hash}`}
    style={styles.leaf({current: props.current === props.hash})}
  >
    {props.name}
  </a>

const Menu = props =>
  <div style={styles.menu({topLevel: props.topLevel})}>
    {
      props.items.map(
        (item, i) =>
          item.type === 'leaf'
            ? <MenuLeaf {...item} current={props.current} key={i} />
            : <MenuNode {...item} current={props.current} key={i} />
      )
    }
  </div>

export default createReactClass({

  propTypes: {
    menu: T.arrayOf(T.object.isRequired).isRequired,
    children: T.node,
    fullWidth: T.bool,
    currentHash: T.string,
  },

  getInitialState() {
    return {
      menuOpen: false,
    }
  },

  handleMenuBtnClick() {
    this.setState({menuOpen: true})
  },

  handleWrapClick(e) {
    if (e.target === this.refs.menuBtn || e.target.parentNode === this.refs.menuBtn) {
      return
    }
    this.setState({menuOpen: false})
  },

  render() {
    const {menu, children, fullWidth, currentHash} = this.props
    const {menuOpen} = this.state
    return <div onClick={this.handleWrapClick} style={styles.wrap}>
      {
        fullWidth && <button onClick={this.handleMenuBtnClick} ref="menuBtn" style={styles.menuBtn}>
          <div style={styles.menuBtnBar} />
          <div style={styles.menuBtnBar} />
          <div style={styles.menuBtnBar} />
        </button>
      }
      <div style={styles.menuWrap({fullWidth, menuOpen})}>
        <Menu items={toTree(menu)} topLevel current={currentHash} />
      </div>
      <div style={styles.content({fullWidth})} key={currentHash}>
        {children}
      </div>
    </div>
  },

})
