import LazyCache from 'react-lazy-cache/noGetters'

import createHigherOrderComponent from './createHigherOrderComponent'
import getDisplayName from './getDisplayName'

/**
 * This component tracks props that affect how the form is mounted to the store. Normally these should not change,
 * but if they do, the connected components below it need to be redefined.
 */
const createReduxFormConnector =
  (isReactNative, React, PropTypes, connect) =>
  (WrappedComponent, mapStateToProps, mapDispatchToProps, mergeProps, options) => {
    const {Component} = React
    class ReduxFormConnector extends Component {
      constructor(props) {
        super(props)
        this.cache = new LazyCache(this, {
          ReduxForm: {
            fn: createHigherOrderComponent(
              props,
              isReactNative,
              React,
              PropTypes,
              connect,
              WrappedComponent,
              mapStateToProps,
              mapDispatchToProps,
              mergeProps,
              options,
            ),
            params: [
              // props that effect how redux-form connects to the redux store
              'reduxMountPoint',
              'form',
              'formKey',
              'getFormState',
            ],
          },
        })
      }

      UNSAFE_componentWillReceiveProps(nextProps) {
        this.cache.componentWillReceiveProps(nextProps)
      }

      render() {
        const ReduxForm = this.cache.get('ReduxForm')
        // remove some redux-form config-only props
        const {reduxMountPoint, destroyOnUnmount, form, getFormState, touchOnBlur, touchOnChange, ...passableProps} =
          this.props
        return <ReduxForm {...passableProps} />
      }
    }
    ReduxFormConnector.displayName = `ReduxFormConnector(${getDisplayName(WrappedComponent)})`
    ReduxFormConnector.WrappedComponent = WrappedComponent
    ReduxFormConnector.propTypes = {
      destroyOnUnmount: PropTypes.bool,
      form: PropTypes.string.isRequired,
      formKey: PropTypes.string,
      getFormState: PropTypes.func,
      reduxMountPoint: PropTypes.string,
      touchOnBlur: PropTypes.bool,
      touchOnChange: PropTypes.bool,
    }
    ReduxFormConnector.defaultProps = {
      getFormState: (state, reduxMountPoint) => state[reduxMountPoint],
      reduxMountPoint: 'form',
    }
    return ReduxFormConnector
  }

export default createReduxFormConnector
