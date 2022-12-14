import createReduxFormConnector from './createReduxFormConnector';
import hoistStatics from 'hoist-non-react-statics';

/**
 * The decorator that is the main API to redux-form
 */
const createReduxForm =
  (isReactNative, React, PropTypes, connect) => {
    const {Component} = React;
    const reduxFormConnector = createReduxFormConnector(isReactNative, React, PropTypes, connect);
    return (config, mapStateToProps, mapDispatchToProps, mergeProps, options) =>
      WrappedComponent => {
        const ReduxFormConnector = reduxFormConnector(WrappedComponent, mapStateToProps, mapDispatchToProps, mergeProps, options);
        const configWithDefaults = {
          touchOnBlur: true,
          touchOnChange: false,
          destroyOnUnmount: true,
          ...config
        };
        class ConnectedForm extends Component {
          render() {
            return (<ReduxFormConnector
              {...configWithDefaults}
              {...this.props}
              submitPassback={submit => this.submit = submit}/>);
          }
        }
        return hoistStatics(ConnectedForm, WrappedComponent);
      };
  };

export default createReduxForm;
