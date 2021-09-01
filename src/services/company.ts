import { Service, Inject } from 'typedi';
import { ICompany } from './../interfaces/ICompany';
import { IAbout } from './../interfaces/IAbout';

@Service()
export default class CompanyService {
  constructor(
    @Inject('companyModel') private companyModel: Models.CompanyModel,
    @Inject('aboutModel') private aboutModel: Models.AboutModel,
  ){
  }
    
  public async SetCompany(token, req ): Promise<{ companyRecord: ICompany }> {
    try{
      console.log("Submitting the Company Details");
      var skills = req.body.skills.split(",")

      const aboutRecord = await this.aboutModel.create({
        _id: token.sub,
        about: req.body.about
      });

      // sanity check for data skill count has to be applied each skill not greater then 100 char and array size not greater then 50.
      // sanity check for user whatsapp Number , jobtitle not more the 100 char, about not more then 1000 characters 
      // as it is both good for the recruiter to read and the candidate to describe in the reading aspect for the profile
      const companyRecord = await this.companyModel.create({
        _id: token.sub,  // cognitoUsername will be used as the id parameter for the user table.
        name: req.body.name,
        whatsappNumber: req.body.whatsappNumber,
        location: req.body.location,
        prefferedIndustry:req.body.prefferedIndustry,
        skills:skills,
        empSize:req.body.empSize,
        site:req.body.site,
        aboutid: aboutRecord['_id']
      });
      console.log(companyRecord);
      // Need to update the data in the user model also need to remove console logs once upadted the method properly
      return { companyRecord }  
    }
    catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async GetCompany(token): Promise<{ companyRecord: ICompany  , aboutRecord: IAbout }> {
    try{
      console.log("Submitting the Company Details");

      // sanity check for data skill count has to be applied each skill not greater then 100 char and array size not greater then 50.
      // sanity check for user whatsapp Number , jobtitle not more the 100 char, about not more then 1000 characters 
      // as it is both good for the recruiter to read and the candidate to describe in the reading aspect for the profile
      const companyRecord = await this.companyModel.findById(token.sub);
      console.log(companyRecord);

      const aboutRecord = await this.aboutModel.findById(token.sub);

      // Need to update the data in the user model also need to remove console logs once upadted the method properly
      return { companyRecord , aboutRecord }  
    }
    catch (e) {
      throw e;
    }
  }
}
