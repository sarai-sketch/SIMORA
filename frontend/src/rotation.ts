export type Crop = 'corn'|'potato'|'fava'|'quinoa'|'cover';
export type Rotation = [Crop,Crop,Crop];
export const cropInfo:Record<Crop,{name:string;color:string;group:string;description:string}>={
 corn:{name:'Corn',color:'#f5c951',group:'cereal',description:'A cereal crop that draws nutrients from the soil.'},
 potato:{name:'Potato',color:'#ce976b',group:'tuber',description:'A tuber crop that requires suitable soil structure and nutrient management.'},
 fava:{name:'Fava bean',color:'#76c66d',group:'legume',description:'A legume that can contribute nitrogen to the cropping system.'},
 quinoa:{name:'Quinoa',color:'#d99bca',group:'pseudocereal',description:'An Andean crop that requires locally adapted management.'},
 cover:{name:'Cover crop',color:'#69cda3',group:'cover',description:'Vegetative cover that helps protect soil between cash crops.'}
};
export const crops=Object.keys(cropInfo) as Crop[];
export const starter:Rotation[]=[['corn','fava','potato'],['potato','quinoa','fava'],['corn','cover','quinoa']];
export type RotationScore={soil:number;water:number;diversity:number;score:number;notes:string[]};
export function evaluate(rotation:Rotation):RotationScore{
 const groups=rotation.map(c=>cropInfo[c].group);
 const changes=groups.slice(1).filter((g,i)=>g!==groups[i]).length;
 const unique=new Set(groups).size;
 const legumes=rotation.filter(c=>c==='fava').length;
 const covers=rotation.filter(c=>c==='cover').length;
 const repeat=rotation.slice(1).filter((c,i)=>c===rotation[i]).length;
 const soil=Math.min(100,Math.max(10,42+changes*13+legumes*13+covers*14-repeat*18));
 const water=Math.min(100,Math.max(10,48+changes*8+covers*18+legumes*5-repeat*10));
 const diversity=Math.round(unique/3*100);
 const score=Math.round(soil*.45+water*.25+diversity*.30);
 const notes:string[]=[];
 if(repeat)notes.push('Planting the same crop in consecutive seasons can increase some pest and disease risks and draw down similar resources.');
 if(legumes)notes.push('Your rotation includes fava bean, a legume that can contribute nitrogen under suitable conditions.');
 if(covers)notes.push('A cover crop can help protect the soil between production seasons.');
 if(changes===2)notes.push('The sequence changes crop groups between all three seasons.');
 if(!notes.length)notes.push('Consider introducing a legume or cover crop and check the sequence with local agronomic guidance.');
 return {soil,water,diversity,score,notes};
}
