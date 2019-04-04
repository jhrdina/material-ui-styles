"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = hoistStatics;

/**
 * Copies internal immediate statics from material-ui from source to target
 */
function hoistStatics(target, source) {
  var internals = ['muiName'];

  for (var i = 0; i < internals.length; i += 1) {
    var key = internals[i];
    var descriptor = Object.getOwnPropertyDescriptor(source, key);

    try {
      Object.defineProperty(target, key, descriptor);
    } catch (e) {// Avoid failures from read-only properties and undefined descriptors
    }
  }

  return target;
}