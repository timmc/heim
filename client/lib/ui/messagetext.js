var _ = require('lodash')
var React = require('react')
var Autolinker = require('autolinker')

var chat = require('../stores/chat')
var hueHash = require('../huehash')


var autolinker = new Autolinker({
  twitter: false,
  truncate: 40,
  replaceFn: function(autolinker, match) {
    if (match.getType() == 'url') {
      var url = match.getUrl()
      var tag = autolinker.getTagBuilder().build(match)

      if (/^javascript/.test(url.toLowerCase())) {
        // Thanks, Jordan!
        return false
      }

      if (location.protocol == 'https:' && RegExp('^https?:\/\/' + location.hostname).test(url)) {
        // self-link securely
        tag.setAttr('href', url.replace(/^http:/, 'https:'))
      } else {
        tag.setAttr('rel', 'noreferrer')
      }

      return tag
    }
  },
})

module.exports = React.createClass({
  displayName: 'MessageText',

  mixins: [
    require('react-immutable-render-mixin'),
  ],

  render: function() {
    var html = _.escape(this.props.content)

    html = html.replace(/\B&amp;(\w+)(?=$|[^\w;])/g, function(match, name) {
      return React.renderToStaticMarkup(<a href={'/room/' + name} target="_blank">&amp;{name}</a>)
    })

    html = html.replace(chat.mentionRe, function(match, name) {
      var color = 'hsl(' + hueHash.hue(name) + ', 50%, 42%)'
      return React.renderToStaticMarkup(<span style={{color: color}} className="mention-nick">@{name}</span>)
    })

    html = autolinker.link(html)

    return <span className={this.props.className} style={this.props.style} dangerouslySetInnerHTML={{
      __html: html
    }} />
  },
})
