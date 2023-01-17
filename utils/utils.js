const replaceSpacesWithUnderScore = (str) => {
  try {
    if (str && (typeof(str) === 'string')) {
      const replaced =str.split(' ').join('_');
      return replaced;
    } else{
        throw `Bad String`;
    }
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

module.exports={replaceSpacesWithUnderScore};
