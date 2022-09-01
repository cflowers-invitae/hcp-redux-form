# redux-form

---

## Invitae Notes

This is a fork of the official `redux-form` package at version `4.2.2`. The package has been modified to support React 16.

This fork was made specifically for [HCP](https://github.com/invitae-internal/health-care-provider) and should not be used
in any other application. This fork allows HCP to begin using other [Fresco](https://github.com/invitae-internal/fresco)
packages that are dependent on React 16 features (hooks, context, etc), while ultimately working to remove all usages of `redux-form`.

Changes consist of:

- Updated supported/peer versions of `react`, `react-dom`, `redux`, and `react-redux` to support React 16
- Renamed deprecated lifecycle methods with `UNSAFE_` prefix (React 16 change)
- Updated internal references to `prop-types` to reference the specific package instead of pulling it from `React.Proptypes` (React 16 change)
- Updated tests that use React/JSX to use the `TestUtils` api and package in `react-dom/test-utils` (React 16 change)
- Update build mechanism to use rollup to align with Fresco standard build process
- Update main `index.js` entrypoint to typescript for rollup & JSX compilation support
- Updated JSX files to `tsx` extension for compilation support
- Include typings from `@types/redux-form@v4` in the main `index.ts` entrypoint. Some generics were given default values to help HCP adoption (`FieldProp` and `ReduxFormProps` as examples)

## Original Documentation

[<img src="http://npm.packagequality.com/badge/redux-form.png" align="right"/>](http://packagequality.com/#?package=redux-form)

[![NPM Version](https://img.shields.io/npm/v/redux-form.svg?style=flat)](https://www.npmjs.com/package/redux-form)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-form.svg?style=flat)](https://www.npmjs.com/package/redux-form)
[![Build Status](https://img.shields.io/travis/erikras/redux-form/master.svg?style=flat)](https://travis-ci.org/erikras/redux-form)
[![codecov.io](https://codecov.io/github/erikras/redux-form/coverage.svg?branch=master)](https://codecov.io/github/erikras/redux-form?branch=master)
[![PayPal donate button](http://img.shields.io/paypal/donate.png?color=yellowgreen)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3QQPTMLGV6GU2)
[![Twitter URL](https://img.shields.io/twitter/url/https/github.com/erikras/redux-form.svg?style=social)](https://twitter.com/intent/tweet?text=With%20@ReduxForm,%20I%20can%20keep%20all%20my%20form%20state%20in%20Redux!%20Thanks,%20@erikras!)

`redux-form` works with [React Redux](https://github.com/rackt/react-redux) to enable an html form in
[React](https://github.com/facebook/react) to use [Redux](https://github.com/rackt/redux) to store all of its state.

[<img src="logo.png" align="right" class="logo" height="151" width="250"/>](http://erikras.github.io/redux-form/)

## Installation

`npm install --save redux-form`

## Documentation

- [Getting Started](docs/GettingStarted.md)
- [Examples](http://erikras.github.io/redux-form/#/examples)
- [API](http://erikras.github.io/redux-form/#/api)
- [FAQ](http://erikras.github.io/redux-form/#/faq)
- [Release Notes](https://github.com/erikras/redux-form/releases)
- [Tools](https://github.com/erikras/redux-form/blob/master/tools.md)

## Community

[Adding A Robust Form Validation To React Redux Apps - Blog](https://medium.com/@rajaraodv/adding-a-robust-form-validation-to-react-redux-apps-616ca240c124#.1iyuelj2e)
