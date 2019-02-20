const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits
const connect = require('react-redux').connect
const Identicon = require('./identicon')
const prefixForNetwork = require('../../lib/etherscan-prefix-for-network')
const selectors = require('../selectors')
const actions = require('../actions')
const { conversionUtil, multiplyCurrencies } = require('../conversion-util')

const pluginMenuDropdown = require('./dropdowns/plugin-menu-dropdown.js')

function mapStateToProps (state) {
  return {
    pluginsScripts: state.metamask.pluginsScripts,
    currentCurrency: state.metamask.currentCurrency,
    selectedPluginUid: state.metamask.selectedPluginUid,    
    userAddress: selectors.getSelectedAddress(state),
    contractExchangeRates: state.metamask.contractExchangeRates,
    conversionRate: state.metamask.conversionRate,
    sidebarOpen: state.appState.sidebar.isOpen,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setSelectedPluginUid: pluginUid => dispatch(actions.setSelectedPluginUid(pluginUid)),    
    hideSidebar: () => dispatch(actions.hideSidebar()),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(PluginCell)

inherits(PluginCell, Component)
function PluginCell () {
  Component.call(this)

  this.state = {
    pluginMenuOpen: false,
  }
}

PluginCell.prototype.render = function () {
  const { pluginMenuOpen } = this.state
  const props = this.props
  console.log(props)
  const {
    uid,
    authorAddress,
    name,
    scriptUrl,
    gatewayAddress,
    symbol,
    string,
    personaPath,
    setSelectedPluginUid,
    selectedPluginUid,
    contractExchangeRates,
    conversionRate,
    hideSidebar,
    sidebarOpen,
    currentCurrency,
    // userAddress,
    image,
  } = props
//  console.log(this.props)

  let balance
  if (this.props.pluginsScripts[uid]){
    balance = JSON.stringify(this.props.pluginsScripts[uid].mainBalance) + " ETH"
  }
  else {
    balance = "loading"
  }

  return (
    h('div.plugin-list-item', {
      className: "plugin-list-item",
      onClick: () => {
        setSelectedPluginUid(uid)
      },
    }, [
      h('div', name),
      h('div', uid),
      h('div', "personaPath: " + personaPath),      
      h('div', "script: " + scriptUrl),

      h('div', balance),
      
      h('i.fa.fa-ellipsis-h.fa-lg.plugin-list-item__ellipsis.cursor-pointer', {
          onClick: (e) => {
            e.stopPropagation()
            this.setState({ pluginMenuOpen: true })
          },
        }),
      pluginMenuOpen && h(pluginMenuDropdown, {
        onClose: () => this.setState({ pluginMenuOpen: false }),
        plugin: { name, uid, scriptUrl, gatewayAddress },
      }),
    ])
  )
}

PluginCell.prototype.view = function (address, userAddress, network, event) {
  const url = etherscanLinkFor(address, userAddress, network)
  if (url) {
    navigateTo(url)
  }
}

function navigateTo (url) {
  global.platform.openWindow({ url })
}

function etherscanLinkFor (pluginGatewayAddress, address, network) {
  const prefix = prefixForNetwork(network)
  return `https://${prefix}etherscan.io/token/${pluginGatewayAddress}?a=${pluginGatewayAddress}`
}
