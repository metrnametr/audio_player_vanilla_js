import { isEmpty, isArray, isString, keys, forEach } from 'lodash';

function createElement(element, classNames, attributes, children) {
  const el = document.createElement(element);
  if (!isEmpty(classNames)) isArray(classNames) ? forEach(classNames, (className) => el.classList.add(className)) : el.classList.add(classNames);

  if (!isEmpty(attributes)) {
    if (attributes.styles) {
      forEach(keys(attributes.styles), (style) => el.style[style] = attributes.styles[style]);
      delete attributes.styles;
    }
    forEach(keys(attributes), (attribute) => el[attribute] = attributes[attribute]);
  }

  if (!isString(children) && children !== undefined) {
    isArray(children) ? forEach(children, (child) => el.appendChild(child)) : el.appendChild(children);
  } 
  if (isString(children) && children !== undefined) {
    el.innerText = children;
  }

  return el;
}

export default createElement;