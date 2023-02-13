const SignContract = artifacts.require("SignContract.sol");

module.exports = function(deployer) {
  deployer.deploy(SignContract);
};
