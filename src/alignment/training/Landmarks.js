/*
 * 随机数训练数据 
 * 每个随机树的训练需要用到形状索引特征，
 * 在训练随机树时，我们的输入是X={I,S}，而预测回归的目标是Y= ΔS。
 * 在实际的训练随机树时，树中的每个节点的训练过程都是一样的。
 * 在训练某个节点时，从事先随机生成的Shape-indexed特征集合F中选取一个
 *（也可以临时随机生成一个特征集合，或者是整棵随机树使用一个特征集合或整个随机森林使用一个特征结合，
 * 此时假设这棵随机树使用一个特征集合），
 * 选取的特征能够将所有样本点X映射成一个实数集合，
 * 我们在随机一个阈值将样本点分配到左右子树中，而分配的目的是希望左右子树的样本点的Y具有相同的模式
 */

tracking.LBF.LandmarksData=[[.0125684,.210687],[.0357801,.468239],[.115541,.712995],[.284357,.905924],[.514999,.996969],[.742149,.899084],[.908075,.698924],[.976219,.446131],[.985153,.186042],[.102259,.0993176],[.244642,.0382795],[.405298,.0817395],[.574051,.0755624],[.736492,.0254858],[.879617,.0749889],[.494662,.182299],[.409008,.498333],[.502223,.532951],[.594788,.495907],[.201686,.196578],[.249652,.163191],[.313234,.163275],[.363542,.203391],[.628143,.197082],[.675643,.154603],[.738182,.151877],[.787497,.18301],[.321899,.669231],[.502462,.632468],[.692712,.659599],[.50761,.764184]];
