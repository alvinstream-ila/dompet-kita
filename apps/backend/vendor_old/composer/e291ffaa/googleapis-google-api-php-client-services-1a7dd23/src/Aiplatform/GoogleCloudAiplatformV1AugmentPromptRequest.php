<?php

/*
 * Copyright 2014 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

namespace Google\Service\Aiplatform;

use Google\Collection;

class GoogleCloudAiplatformV1AugmentPromptRequest extends Collection
{
    protected $collection_key = 'contents';

    protected $contentsType = GoogleCloudAiplatformV1Content::class;

    protected $contentsDataType = 'array';

    protected $modelType = GoogleCloudAiplatformV1AugmentPromptRequestModel::class;

    protected $modelDataType = '';

    protected $vertexRagStoreType = GoogleCloudAiplatformV1VertexRagStore::class;

    protected $vertexRagStoreDataType = '';

    /**
     * Optional. Input content to augment, only text format is supported for now.
     *
     * @param  GoogleCloudAiplatformV1Content[]  $contents
     */
    public function setContents($contents)
    {
        $this->contents = $contents;
    }

    /**
     * @return GoogleCloudAiplatformV1Content[]
     */
    public function getContents()
    {
        return $this->contents;
    }

    /**
     * Optional. Metadata of the backend deployed model.
     */
    public function setModel(GoogleCloudAiplatformV1AugmentPromptRequestModel $model)
    {
        $this->model = $model;
    }

    /**
     * @return GoogleCloudAiplatformV1AugmentPromptRequestModel
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * Optional. Retrieves contexts from the Vertex RagStore.
     */
    public function setVertexRagStore(GoogleCloudAiplatformV1VertexRagStore $vertexRagStore)
    {
        $this->vertexRagStore = $vertexRagStore;
    }

    /**
     * @return GoogleCloudAiplatformV1VertexRagStore
     */
    public function getVertexRagStore()
    {
        return $this->vertexRagStore;
    }
}

// Adding a class alias for backwards compatibility with the previous class name.
class_alias(GoogleCloudAiplatformV1AugmentPromptRequest::class, 'Google_Service_Aiplatform_GoogleCloudAiplatformV1AugmentPromptRequest');
