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

const stringToArray= (str) =>{
 try {
  if(str){
    let res= str.split(",");
    return res;
  } else{
    throw `Bad zabbix name`;
  }
 } catch (error) {
    return error;
 }
}

module.exports={replaceSpacesWithUnderScore,stringToArray};
