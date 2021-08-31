const Verifier = require('verify-cognito-token');

var awsRegion = "";
awsRegion = process.env.REGION.toString()

var userPoolId = "";
userPoolId = process.env.USER_POOL_ID.toString()

/*
 * set the params for the cognito authentication
 */

const params = {
  region: awsRegion,  // required <your-aws-region>
  userPoolId: userPoolId, // required <your-user-pool-id>
  debug: true // optional parameter to show console logs
}

/**
 * We are assuming that the Cognito JWT token will come from header
 * Authorization: Bearer ${JWT}
 */

const isAuth = (req, res, next) => {
  /**
   * @TODO This middleware is used to verify whether the token is valid or not
   * if token true theen decode the token and return else return NULL
   */
  if (
    req.headers.authorization != null
  ) 
  {
    try {
      //console.log("Validating the user ...");
      var verifier = new Verifier(params);
      verifier.verify(req.headers.authorization)
      .then(result =>{
        if(result == false)
        {
          //console.log("Validation failed");
          return res.sendStatus(401);
        }
        else
        {
          //console.log("This is a valid user");
          return next()
        }
      });    
    }
    catch(e) {
      //console.log("Entered the catch block");
      res.sendStatus(401);
      return next(e)
    }
  }
  else{
    return res.sendStatus(401);
  }
};


export default isAuth;
