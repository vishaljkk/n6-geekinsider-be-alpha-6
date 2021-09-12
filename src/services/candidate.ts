import { Service, Inject } from 'typedi';
import { ICandidate } from './../interfaces/ICandidate';
import { IConnect } from '../interfaces/IConnect';
import { IAbout } from './../interfaces/IAbout';
import { IGit } from './../interfaces/IGit';
import mongoose from 'mongoose';
import candidate from '@/models/candidate';
const axios = require('axios');

@Service()
export default class CandidateService {
  constructor(
    @Inject('candidateModel') private candidateModel: Models.CandidateModel,
    @Inject('aboutModel') private aboutModel: Models.AboutModel,
    @Inject('connectModel') private connectModel: Models.ConnectModel,
    @Inject('jobModel') private jobModel: Models.JobModel,
    @Inject('gitModel') private gitModel: Models.GitModel,
    ){
  }

  public async GetCandidateInfo(canid): Promise<any>{
    try{
      const aboutRecord = await this.aboutModel.findOne({
        _id: canid
      });
      console.log(aboutRecord);
      return aboutRecord;
    }catch(e){
      throw e;  
    }
  }  

  public async GetGitInfo(canid): Promise<any>{
    try{
      const gitRecord = await this.gitModel.findOne({
        _id: canid
      });
      console.log(gitRecord);
      return gitRecord;
    }catch(e){
      throw e;  
    }
  }  


  public async SetCandidate(token, req ): Promise<{ candidateRecord: ICandidate }> {
    try{
      console.log("Submitting the About Section For the Candidate");

      const aboutRecord = await this.aboutModel.create({
        _id: token.sub,
        about: req.body.about
      });

      console.log("Submitting the Candidate Details");
      var skills = req.body.skills.split(",")
      
      // sanity check for data skill count has to be applied each skill not greater then 100 char and array size not greater then 50.
      // sanity check for user whatsapp Number , jobtitle not more the 100 char, about not more then 1000 characters 
      // as it is both good for the recruiter to read and the candidate to describe in the reading aspect for the profile
      const candidateRecord = await this.candidateModel.create({
        _id: token.sub,  // cognitoUsername will be used as the id parameter for the user table.
        name: req.body.name,
        whatsappNumber: req.body.whatsappNumber,
        jobTitle:req.body.jobTitle,
        location: req.body.location,
        skills:skills,
        githubUrl: req.body.githubUrl,
        ctc:req.body.ctc,
        exp:req.body.exp,
        aboutid: aboutRecord['_id'],
        email: token.email 
      });
      console.log(candidateRecord);

      // Need to update the data in the user model also need to remove console logs once upadted the method properly
      return { candidateRecord }  
    }
    catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async SetGithub(token,req):Promise<any>
  {
    try 
    {
      const getRepoCount = await axios.get('https://api.github.com/users/'+req.body.githubUrl) // https://api.github.com/users/vishaljkk/repos
      console.log(getRepoCount.data.public_repos);
      
      const response = await axios.get('https://api.github.com/users/'+req.body.githubUrl+'/repos')

      var i = 0;
      var repoNameList = [];
      var languageList = [];
      var languageCounter = [];
      var languageListSorted = [];
      
      for(;i<response.data.length;i++)
      {
        repoNameList.push(response.data[i].name);
        if(response.data[i].language == null)
        {
          continue;
        }
        var index = languageList.indexOf(response.data[i].language)
        if(index != -1)
        {
          languageCounter[index] = languageCounter[index]+1
        }
        else
        {
          languageList.push(response.data[i].language);
          languageCounter.push(1)
        }
      }

      for (let i=0; i< languageCounter.length; i++)
      {
        for (let j=i; j<languageCounter.length;j++)
        {
          console.log(languageCounter[i],languageCounter[j]);
          if (languageCounter[i] < languageCounter[j]) {
            console.log(languageCounter[i],languageCounter[j]);
            let temp = languageCounter[i];
            languageCounter[i]= languageCounter[j]
            languageCounter[j]= temp;
            let templang = languageList[i];
            languageList[i]= languageList[j]
            languageList[j]= templang;
          }
        }
      }

      // here we add the git data to our mongoose model

      const gitRecord = await this.gitModel.create({
        _id: token.sub, // slug+1 // cognitoUsername will be used as the id parameter for the user table.
        repoCount: getRepoCount.data.public_repos,
        repoName: repoNameList,
        skills: languageList,
        skillsOrder: languageCounter,
      });
      console.log(gitRecord);                                        // Need to update the data in the user model also need to remove console logs once upadted the method properly
    }
    catch (e) {
      throw e;
    }    
  }

  public async GetRecoCanList(token): Promise<any> {
    try
    {
      const candidateRecords = await this.candidateModel.find(token.sub);
            
      return candidateRecords;                                        // Need to update the data in the user model also need to remove console logs once upadted the method properly
    }
    catch (e) {
      throw e;
    }
  }
  
  public async GetCandidate(token): Promise<{ candidateRecord: ICandidate , aboutRecord: IAbout }> {
    try
    {
      console.log("Fetching the Candidate Details");

      // sanity check for data skill count has to be applied each skill not greater then 100 char and array size not greater then 50.
      // sanity check for user whatsapp Number , jobtitle not more the 100 char, about not more then 1000 characters 
      // as it is both good for the recruiter to read and the candidate to describe in the reading aspect for the profile
      
      const candidateRecord = await this.candidateModel.findById(token.sub);
      //var ObjectId = mongoose.Types.ObjectId;                              
      //var query = { '_id': new ObjectId(candidateRecord.aboutid.toString()) };
      const aboutRecord = await this.aboutModel.findById(token.sub);
      console.log(aboutRecord, candidateRecord);
      // const aboutRecord = await this.aboutModel.find({ "_id": mongoose.Types.ObjectId(candidateRecord['aboutid']) });                          //console.log(aboutRecord);
            
      return { candidateRecord , aboutRecord }                                        // Need to update the data in the user model also need to remove console logs once upadted the method properly
    }
    catch (e) {
      throw e;
    }
  }

    // sanity check for data skill count has to be applied each skill not greater then 100 char and array size not greater then 50.
    // public async GetAppliedCan(token, req): Promise<any>
    // {
    //     try
    //     {         
    //         // const jobRecord = await this.jobModel.find(token.sub);                                                        // console.log("Fetching the Candidate Details");                                                                                                           //var ObjectId = mongoose.Types.ObjectId;                                                     
    //         //var query = { 'companyName':  };

    //         // const jobRecord = await this.jobModel.find(query);          

    //         var jobList = [];
    //         var i=0;
    //         for(;i<jobRecord.length;i++)
    //         {
    //             var job = {
    //                 companyName: jobRecord[i].companyName,
    //                 jobTitle: jobRecord[i].jobTitle,
    //                 jobLocation: jobRecord[i].jobLocation,
    //                 jobStatus: jobRecord[i].jobStatus,
    //                 skills: jobRecord[i].skills,
    //                 jobslug: jobRecord[i].jobslug,
    //                 ctc: jobRecord[i].ctc,
    //                 exp: jobRecord[i].exp                
    //             }        
    //             jobList.push(job);
    //         }

    //         return jobList;                                                                                                          // Need to update the data in the user model also need to remove console logs once upadted the method properly
    //     }
    //     catch (e) {
    //         throw e;
    //     }
    // }
                        

  public async GetCandidateBasedOnJob(token): Promise<{ candidateRecord: ICandidate , aboutRecord: IAbout }> {
    try
    {
      console.log("Fetching the Candidate Details");

      // sanity check for data skill count has to be applied each skill not greater then 100 char and array size not greater then 50.
      // sanity check for user whatsapp Number , jobtitle not more the 100 char, about not more then 1000 characters 
      // as it is both good for the recruiter to read and the candidate to describe in the reading aspect for the profile
      
      const candidateRecord = await this.candidateModel.findById(token.sub);
      //var ObjectId = mongoose.Types.ObjectId;                              
      //var query = { '_id': new ObjectId(candidateRecord.aboutid.toString()) };
      
      const aboutRecord = await this.aboutModel.findById(token.sub);
      console.log(aboutRecord, candidateRecord);
      // const aboutRecord = await this.aboutModel.find({ "_id": mongoose.Types.ObjectId(candidateRecord['aboutid']) });                          //console.log(aboutRecord);
            
      return { candidateRecord , aboutRecord }                                        // Need to update the data in the user model also need to remove console logs once upadted the method properly
    }
    catch (e) {
      throw e;
    }
  }


  public async ApplyJob(token,jobid): Promise<any> {
    try
    {
      console.log("Applying the Candidate Details with job slug : ",jobid);
     
      const jobRecord = await this.jobModel.findOne({
        jobslug: jobid,
      });
      console.log(jobRecord);

      var chatid = token.sub+"-"+jobid;

      console.log(jobRecord['companyId'],token.sub);

      console.log(token.sub," ",jobRecord['companyId']);

      const chatRecord = await this.connectModel.create({
        _id: chatid, // slug+1 // cognitoUsername will be used as the id parameter for the user table.
        candidateid: token.sub,
        companyid: jobRecord['companyId'],
        jobslug: jobid,
        status: 1,
      });

      console.log(chatRecord);

      return chatRecord;                                         // Need to update the data in the user model also need to remove console logs once upadted the method properly
    }
    catch (e) {
      throw e;
    }
  }
}
