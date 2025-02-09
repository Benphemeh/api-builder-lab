export const userOnBoardEmail = (email: string, url: string) => {
  return `<p>Hi ${email},</p>
  <p>Your account has been created on api-builder App. </p>
  <p>Click on the link below to change the default password to your desired password </p>
  
  <p>
      <a href=${url} >Confirm</a>
  </p>
  
  
  <p>If you did not request this email you can safely ignore it.</p>`;
};

export const sendUserConfirmation = (email: string, url: string) => {
  return `<p>Hi ${email},</p>
  <p>Your account has been created on api-builder App. </p>
  <p>Click on the link below to change the default password to your desired password </p>
  
  <p>
      <a href=${url} >Confirm</a>
  </p>
  
  
  <p>If you did not request this email you can safely ignore it.</p>`;
};
